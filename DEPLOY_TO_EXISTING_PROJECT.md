# 🎯 기존 Railway 프로젝트에 배포하기

## 📋 프로젝트 정보
- **프로젝트 ID**: `ee4d4614-de91-4193-a6cb-1e3efaec1eed`
- **환경 ID**: `0109d975-5c02-4f22-ae5d-865ba77a95d2`
- **프로젝트 URL**: https://railway.com/project/ee4d4614-de91-4193-a6cb-1e3efaec1eed

## 🚀 배포 방법

### 방법 1: Railway 웹 대시보드 (추천)

1. **프로젝트 접속**
   ```
   https://railway.com/project/ee4d4614-de91-4193-a6cb-1e3efaec1eed
   ```

2. **새 서비스 추가**
   - "+ New" 버튼 클릭
   - "GitHub Repo" 또는 "Empty Service" 선택

3. **소스 코드 업로드**
   - 이 폴더의 모든 파일을 업로드:
     - `Dockerfile`
     - `railway.toml`
     - `webapp/` 폴더
     - `README.md`

4. **자동 배포**
   - Railway가 `Dockerfile`을 감지하여 자동 빌드
   - 환경 변수 자동 설정: `PORT=8080`

### 방법 2: GitHub 연동

1. **GitHub 저장소 생성**
   - 새 저장소 생성: `deadlock-stats`
   - 이 폴더의 파일들을 GitHub에 푸시

2. **Railway에서 GitHub 연결**
   - 프로젝트에서 "+ New" → "GitHub Repo"
   - 저장소 선택하여 연결

3. **자동 배포**
   - GitHub 푸시 시 자동 배포

### 방법 3: Git Push 배포

```bash
# Git 저장소 초기화 (이미 완료됨)
git remote add railway https://railway.app/project/ee4d4614-de91-4193-a6cb-1e3efaec1eed.git

# 배포 푸시
git push railway main
```

## 🔧 환경 설정

배포 후 Railway 대시보드에서 확인할 설정:

- **PORT**: 8080 (자동 설정)
- **JAVA_OPTS**: -Xmx512m (메모리 최적화)
- **Health Check**: `/deadlock-stats`

## 🌐 접속 URL

배포 완료 후:
```
https://[서비스명]-[환경ID].up.railway.app/deadlock-stats
```

## 📊 배포 내용

- **Java 11 + Tomcat 9** 환경
- **Deadlock Stats 웹 애플리케이션**
- **실시간 API 연동**
- **반응형 웹 인터페이스**

---

**추천**: Railway 웹 대시보드에서 직접 파일 업로드가 가장 간단합니다!