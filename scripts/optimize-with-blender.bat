@echo off
REM Optimize 3D models using Blender
REM Usage: optimize-with-blender.bat input.glb output.glb [target_polys]

SET BLENDER="C:\Program Files\Blender Foundation\Blender 4.0\blender.exe"
SET SCRIPT=%~dp0blender-decimate.py

IF "%~1"=="" (
    echo Usage: optimize-with-blender.bat input.glb output.glb [target_polys]
    echo Example: optimize-with-blender.bat AST_3d.glb AST_3d_optimized.glb 20000
    exit /b 1
)

%BLENDER% --background --python %SCRIPT% -- %*
