const growthImg1 = "";
const growthImg2 = "";
const growthImg3 = "";
/**
 * 누적 시간이 목표 시간의 4분의 1 이상일 때마다 해당하는 단계의 꽃 이미지 url 반환
 */
const getUpdatedFlowerImage = async (quarter, FlowerImage) => {
    if(quarter == 1){
        return growthImg1;
    }else if(quarter == 2){
        return growthImg2;
    }else if(quarter == 3){
        return growthImg3;
    }else if(quarter == 4){
        return FlowerImage;
    }  
};


module.exports = {
    getUpdatedFlowerImage
};