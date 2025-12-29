#!/usr/bin/env node
/**
 * Optimize GLB 3D models for web/AR use
 * Reduces file size by 90%+ while maintaining visual quality
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  draco,
  textureCompress,
  prune,
  quantize,
  weld,
  simplify
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const DOWNLOADS = 'C:/Users/carba/Downloads';
const OUTPUT = 'C:/Users/carba/ecoplantia/public/models';

// Models to optimize
const MODELS = ['RUD_3d', 'LIA_3d', 'ECH_3d', 'COR_3d', 'AST_3d', 'ASC_3d'];

async function optimizeModel(inputPath, outputPath) {
  console.log(`\nOptimizing: ${path.basename(inputPath)}`);

  const inputSize = fs.statSync(inputPath).size;
  console.log(`  Input size: ${(inputSize / 1024 / 1024).toFixed(1)} MB`);

  // Initialize IO with extensions
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  // Read the model
  console.log('  Reading model...');
  const document = await io.read(inputPath);

  // Get mesh stats before
  let totalVertices = 0;
  let totalTriangles = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute('POSITION');
      if (position) totalVertices += position.getCount();
      const indices = prim.getIndices();
      if (indices) totalTriangles += indices.getCount() / 3;
    }
  }
  console.log(`  Vertices: ${totalVertices.toLocaleString()}, Triangles: ${totalTriangles.toLocaleString()}`);

  // Apply optimizations
  console.log('  Applying optimizations...');

  // 1. Remove duplicate data
  await document.transform(dedup());
  console.log('    - Deduplicated');

  // 2. Weld vertices (merge nearby vertices)
  await document.transform(weld({ tolerance: 0.0001 }));
  console.log('    - Welded vertices');

  // 3. Simplify mesh if very high poly (target ~100k triangles max)
  if (totalTriangles > 100000) {
    const ratio = Math.min(100000 / totalTriangles, 0.5);
    try {
      // Note: simplify requires meshoptimizer, skip if not available
      console.log(`    - Skipping simplify (would reduce to ${Math.round(ratio * 100)}%)`);
    } catch (e) {
      console.log('    - Simplify skipped');
    }
  }

  // 4. Quantize vertex attributes (reduces precision, saves space)
  await document.transform(quantize());
  console.log('    - Quantized attributes');

  // 5. Compress textures
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [1024, 1024], // Max 1024x1024
    })
  );
  console.log('    - Compressed textures to WebP 1024x1024');

  // 6. Remove unused data
  await document.transform(prune());
  console.log('    - Pruned unused data');

  // 7. Apply Draco mesh compression (biggest size reduction)
  await document.transform(
    draco({
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12,
      quantizeColor: 8,
    })
  );
  console.log('    - Applied Draco compression');

  // Write optimized model
  console.log('  Writing optimized model...');
  await io.write(outputPath, document);

  const outputSize = fs.statSync(outputPath).size;
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);
  console.log(`  Output size: ${(outputSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Reduction: ${reduction}%`);

  return { inputSize, outputSize };
}

async function main() {
  console.log('=== GLB Model Optimizer ===\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT)) {
    fs.mkdirSync(OUTPUT, { recursive: true });
  }

  let totalInput = 0;
  let totalOutput = 0;

  for (const model of MODELS) {
    const inputPath = path.join(DOWNLOADS, `${model}.glb`);
    const outputPath = path.join(OUTPUT, `${model}.glb`);

    if (!fs.existsSync(inputPath)) {
      console.log(`\nSkipping ${model} - file not found`);
      continue;
    }

    try {
      const { inputSize, outputSize } = await optimizeModel(inputPath, outputPath);
      totalInput += inputSize;
      totalOutput += outputSize;
    } catch (err) {
      console.error(`\nError optimizing ${model}:`, err.message);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total input:  ${(totalInput / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total output: ${(totalOutput / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total reduction: ${((1 - totalOutput / totalInput) * 100).toFixed(1)}%`);
}

main().catch(console.error);
