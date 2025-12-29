#!/usr/bin/env node
/**
 * Light optimization for very large models (skip Draco)
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  textureCompress,
  prune,
  quantize,
} from '@gltf-transform/functions';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const DOWNLOADS = 'C:/Users/carba/Downloads';
const OUTPUT = 'C:/Users/carba/ecoplantia/public/models';

const MODELS = ['AST_3d', 'ASC_3d'];

async function optimizeModel(inputPath, outputPath) {
  console.log(`\nOptimizing (light): ${path.basename(inputPath)}`);

  const inputSize = fs.statSync(inputPath).size;
  console.log(`  Input size: ${(inputSize / 1024 / 1024).toFixed(1)} MB`);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

  console.log('  Reading model...');
  const document = await io.read(inputPath);

  console.log('  Applying light optimizations...');

  // Just texture compression and cleanup - no Draco
  await document.transform(dedup());
  console.log('    - Deduplicated');

  await document.transform(quantize());
  console.log('    - Quantized');

  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [512, 512], // Smaller textures for huge models
    })
  );
  console.log('    - Compressed textures to WebP 512x512');

  await document.transform(prune());
  console.log('    - Pruned');

  console.log('  Writing...');
  await io.write(outputPath, document);

  const outputSize = fs.statSync(outputPath).size;
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);
  console.log(`  Output size: ${(outputSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Reduction: ${reduction}%`);
}

async function main() {
  if (!fs.existsSync(OUTPUT)) {
    fs.mkdirSync(OUTPUT, { recursive: true });
  }

  for (const model of MODELS) {
    const inputPath = path.join(DOWNLOADS, `${model}.glb`);
    const outputPath = path.join(OUTPUT, `${model}.glb`);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${model} - not found`);
      continue;
    }

    try {
      await optimizeModel(inputPath, outputPath);
    } catch (err) {
      console.error(`Error: ${model}:`, err.message);
    }
  }
}

main().catch(console.error);
