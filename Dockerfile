# Node.js 18.18.0 이미지를 사용
FROM node:18.18.0

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 복사 및 의존성 설치
COPY package.json ./

RUN npm cache clean npm install

# Prisma CLI 버전 확인
RUN npx prisma --version

# Prisma schema 파일 복사
COPY prisma ./prisma

# Prisma CLI만 실행 (마이그레이션은 컨테이너 실행 시 수행)
RUN npx prisma generate

# 애플리케이션 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# Prisma 마이그레이션 및 앱 실행
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]