@echo off
cd /d C:\Users\RDP\Desktop\app\maseAccountant\android
set CMAKE_VERSION=3.22.1
set CI=true
echo [%date% %time%] Build started > build_160.log
call gradlew.bat assembleRelease >> build_160.log 2>&1
echo [%date% %time%] BUILD_EXIT_CODE: %ERRORLEVEL% >> build_160.log
