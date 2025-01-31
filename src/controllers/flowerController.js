const axios = require('axios');
const { ErrorCodes, CustomError } = require("../utils/error");
const { parseXml } = require('../utils/xmlParser');
const flowerService = require('../services/flowerService');

// REST URL
const url_1 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlowerList01'; //상세1
//const url_2 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlowerView01'; //상세2
const url_3 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlower01'; //상세3
// 서비스 키 (발급받은 디코딩된 인증키)
const serviceKey = process.env.FLOWER_SERVICE_KEY;

const currentDate = new Date();
 
const getTodayFlower = async (req, res, next) => {
  const fMonth = req.query.fMonth || (currentDate.getMonth()+1).toString();   //기본값: 현재 날짜
  const fDay = req.query.fDay || currentDate.getDate().toString();
  const queryParams = `?serviceKey=${encodeURIComponent(serviceKey)}&fMonth=${fMonth}&fDay=${fDay}`;

  try {
    const response = await axios.get(url_3 + queryParams);
    const parsedData = await parseXml(response.data);

    console.log('parsedData', parsedData);

    //Xml 파싱 결과 검증
    if(!parsedData.document?.root?.[0]?.result){
      throw new CustomError(ErrorCodes.BadRequest, '예상치 못한 API 응답 구조');
    }
  
    const flowerInfo = parsedData.document.root[0].result[0];
    const todayFlower = {
      name: flowerInfo.flowNm[0], 
      language: flowerInfo.flowLang[0], //꽃말
      //imageUrl: flowerInfo.imgUrl1[0],
    };
    res.json(todayFlower);
  } catch (error) {
    next(error);
  }
};


// 라벤더 & 메리골드..존재X문제해결필요
const searchFlower = async (req, res) => {
  const name = req.query.name;

  if (!name) {
    throw new CustomError(ErrorCodes.BadRequest, '꽃 이름이 입력되지 않았습니다.');
  }
  
  try {
    const response = await axios.get(url_1, {
      params: {
        serviceKey: serviceKey,
        searchType: '1',
        searchWord: name,
      },
    });

    //console.log('API 응답 데이터:', response.data);
    const parsedData = await parseXml(response.data);

    if(!parsedData.document?.root?.[0]){
      throw new CustomError(ErrorCodes.InternalServerError, '예상치 못한 API 응답 구조');
    }
    
    const items = parsedData.document.root[0].result;

    if(!items || items.length === 0){
      throw new CustomError(ErrorCodes.NotFound, '검색 결과가 존재하지 않음');
    }

    let flowerInfo;
    
    if (name === '장미') {
      // 장미인 경우 두 번째 결과만 반환
      flowerInfo = [{
        name: items[1]?.flowNm[0],
        language: items[1]?.flowLang[0],
      }];
    } else {
      // 그 외에는 첫 번째 결과만 반환
      flowerInfo = [{
        name: items[0].flowNm[0],
        language: items[0].flowLang[0],
      }];
    }

    res.json(flowerInfo);
  } catch (error) {
    console.error(error);
    throw new CustomError(ErrorCodes.InternalServerError, '서버 오류가 발생했습니다.');
  }
};


const getUnlockedFlowers = async (req, res, next) => {
  const memberId = req.user.id;

  try{
    const unlockedFlowers = await flowerService.findUnlockedFlowers(memberId);
    res.json(unlockedFlowers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayFlower,
  searchFlower,
  getUnlockedFlowers,
};