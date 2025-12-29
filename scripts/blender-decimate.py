"""
Blender script to reduce polygon count of 3D models.

Usage (run from command line):
  blender --background --python blender-decimate.py -- input.glb output.glb 30000

Arguments:
  input.glb   - Input GLB/GLTF file
  output.glb  - Output file path
  30000       - Target polygon count (default: 30000)

Install Blender:
  - Download from https://www.blender.org/download/
  - Or on Mac: brew install --cask blender
  - Or on Windows: winget install BlenderFoundation.Blender
"""

import bpy
import sys
import os

def clear_scene():
    """Remove all objects from scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def import_model(filepath):
    """Import GLB/GLTF file"""
    ext = os.path.splitext(filepath)[1].lower()
    if ext in ['.glb', '.gltf']:
        bpy.ops.import_scene.gltf(filepath=filepath)
    elif ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif ext == '.obj':
        bpy.ops.import_scene.obj(filepath=filepath)
    else:
        raise ValueError(f"Unsupported format: {ext}")

def get_total_polygons():
    """Count total polygons in scene"""
    total = 0
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            total += len(obj.data.polygons)
    return total

def decimate_mesh(obj, ratio):
    """Apply decimate modifier to mesh object"""
    if obj.type != 'MESH':
        return

    # Select and make active
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Add decimate modifier
    mod = obj.modifiers.new(name='Decimate', type='DECIMATE')
    mod.decimate_type = 'COLLAPSE'
    mod.ratio = ratio

    # Apply modifier
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)

def optimize_model(target_polys=30000):
    """Decimate all meshes to reach target polygon count"""
    current_polys = get_total_polygons()

    if current_polys <= target_polys:
        print(f"Model already has {current_polys} polygons (target: {target_polys})")
        return

    ratio = target_polys / current_polys
    print(f"Decimating from {current_polys:,} to ~{target_polys:,} polygons (ratio: {ratio:.4f})")

    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            decimate_mesh(obj, ratio)

    final_polys = get_total_polygons()
    print(f"Final polygon count: {final_polys:,}")

def export_model(filepath):
    """Export to GLB"""
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_materials='EXPORT',
        export_textures=True,
    )

def main():
    # Parse arguments after "--"
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        print("Usage: blender --background --python blender-decimate.py -- input.glb output.glb [target_polys]")
        return

    if len(argv) < 2:
        print("Error: Need input and output file paths")
        return

    input_file = argv[0]
    output_file = argv[1]
    target_polys = int(argv[2]) if len(argv) > 2 else 30000

    print(f"\n=== Blender Model Optimizer ===")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print(f"Target: {target_polys:,} polygons\n")

    # Process
    clear_scene()
    import_model(input_file)

    print(f"Imported: {get_total_polygons():,} polygons")

    optimize_model(target_polys)
    export_model(output_file)

    # Show file sizes
    input_size = os.path.getsize(input_file) / 1024 / 1024
    output_size = os.path.getsize(output_file) / 1024 / 1024
    reduction = (1 - output_size / input_size) * 100

    print(f"\nInput size:  {input_size:.1f} MB")
    print(f"Output size: {output_size:.1f} MB")
    print(f"Reduction:   {reduction:.1f}%")
    print("Done!")

if __name__ == "__main__":
    main()
