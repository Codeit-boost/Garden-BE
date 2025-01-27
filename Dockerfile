# Node.js 18.18.0 이미지를 사용
FROM node:18.18.0

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 복사 및 의존성 설치
COPY package.json ./
RUN npm install

# Prisma CLI 버전 확인
RUN npx prisma --version

# Prisma schema 파일 복사
COPY prisma ./prisma

# Prisma 명령어 실행
RUN npx prisma generate
RUN npx prisma migrate deploy

# 애플리케이션 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["npm", "start"]