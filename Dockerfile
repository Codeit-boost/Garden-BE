# Node.js 18.18.0 이미지를 사용
FROM node:18.18.0

# 빌드 타임 환경 변수 설정
ARG DATABASE_URL
ARG KAKAO_CLIENT_ID
ARG KAKAO_REDIRECT_URI
ARG JWT_SECRET

# 런타임 환경 변수 설정
ENV DATABASE_URL=${DATABASE_URL}
ENV KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}
ENV KAKAO_REDIRECT_URI=${KAKAO_REDIRECT_URI}
ENV JWT_SECRET=${JWT_SECRET}

# 작업 디렉토리 설정
WORKDIR /usr/src

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