@echo off
echo ========================================
echo Railway Deadlock Stats - Windows Setup
echo ========================================
echo.

echo 📁 현재 위치: %CD%
echo 🎯 대상 위치: C:\railway-deploy
echo.

REM C:\railway-deploy 폴더 생성
if not exist "C:\railway-deploy" (
    mkdir "C:\railway-deploy"
    echo ✅ C:\railway-deploy 폴더 생성 완료
) else (
    echo ℹ️  C:\railway-deploy 폴더가 이미 존재합니다
)

echo.
echo 📋 Railway 배포 가이드:
echo.
echo 1️⃣ 파일 확인
echo    - Dockerfile
echo    - railway.toml  
echo    - webapp 폴더
echo    - README.md
echo.
echo 2️⃣ Railway 웹사이트 접속
echo    URL: https://railway.app
echo    토큰: ca58dfb5-5b19-4b34-b307-da3d7ed4355a
echo.
echo 3️⃣ 프로젝트 생성
echo    - "New Project" 클릭
echo    - "Empty Project" 선택
echo    - 이름: deadlock-stats
echo.
echo 4️⃣ 파일 업로드
echo    - "+ New" → "GitHub Repo" 또는 드래그 앤 드롭
echo    - 이 폴더의 모든 파일 업로드
echo.
echo 5️⃣ 배포 완료
echo    - Railway가 자동으로 빌드
echo    - 접속 URL 생성됨
echo.
echo 🌐 배포 후 접속: https://[도메인].railway.app/deadlock-stats
echo.
pause