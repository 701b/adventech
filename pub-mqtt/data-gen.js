// 데이터 생성 주기 (단위: 초)
const dataGenPeriod = 1;

// 태동이 일어나는 최소 심박수
const minHeartRateForFetalMovement = 160;

// 심박수 변화 최대치
const maxHeartRateDeviation = 15 * dataGenPeriod;

// 상태별 정보
const stateInfo = {
    normal: {
        // 해당 상태가 일어날 확률 (값 * 데이터 생성 주기)
        possibility: 0.008 * dataGenPeriod,
        // 해당 상태가 될 조건
        getCondition: () => {
            return true;
        },
        heartRate: {
            // 심박수 기준
            standard: 140,
            // 심박수 변동 최대값
            maxDeviation: 5,
            // 심박수가 기준으로 돌아가려는 경향
            getRestorationTendency: (error) => {
                const sign = error >= 0 ? 1 : -1;
                
                return (Math.pow(1.1, Math.abs(error)) - 1) * sign;
            }
        },
        fetalMovement: {
            // 태동이 일어날 확률 (값 * 데이터 생성 주기)
            possibility: 0 * dataGenPeriod
        }
    },
    high: {
        getCondition: () => {
            return currentHeartRate > stateInfo.normal.heartRate.standard;
        },
        possibility: 0.005 * dataGenPeriod,
        heartRate: {
            standard: 160,
            maxDeviation: 7,
            getRestorationTendency: (error) => {
                const sign = error > 0 ? 1 : -1;
                
                return (Math.pow(1.08, Math.abs(error)) - 1) * sign;
            }
        },
        fetalMovement: {
            possibility: 0.06 * dataGenPeriod
        }
    },
    low: {
        getCondition: () => {
            return currentHeartRate < stateInfo.normal.heartRate.standard;
        },
        possibility: 0.0015 * dataGenPeriod,
        heartRate: {
            standard: 120,
            maxDeviation: 4,
            getRestorationTendency: (error) => {
                const sign = error > 0 ? 1 : -1;
                
                return (Math.pow(1.08, Math.abs(error)) - 1) * sign;
            }
        },
        fetalMovement: {
            possibility: 0 * dataGenPeriod
        }
    },
    irregular: {
        getCondition: () => {
            return currentState === stateInfo.normal;
        },
        possibility: 0.0025 * dataGenPeriod,
        heartRate: {
            standard: 140,
            maxDeviation: 10,
            getRestorationTendency: (error) => {
                const sign = error > 0 ? 1 : -1;
                
                return (Math.pow(1.07, Math.abs(error)) - 1) * sign;
            }
        },
        fetalMovement: {
            possibility: 0.07 * dataGenPeriod
        }
    }
};

let currentHeartRate = stateInfo.normal.heartRate.standard;
let currentState = stateInfo.normal;

function generateData() {
    let isFetusMoved = false;
    let randomValue = Math.random();
    const signFactor = Math.random() < 0.5 ? 1 : -1;
    
    if (stateInfo.normal.getCondition() && randomValue < stateInfo.normal.possibility) {
        currentState = stateInfo.normal;
        console.log("normal 진입");
    } else {
        randomValue -= stateInfo.normal.possibility;
        
        if (stateInfo.high.getCondition() && randomValue < stateInfo.high.possibility) {
            currentState = stateInfo.high;
            console.log("high 진입");
        } else {
            randomValue -= stateInfo.high.possibility;
            
            if (stateInfo.low.getCondition() && randomValue < stateInfo.low.possibility) {
                currentState = stateInfo.low;
                console.log("low 진입");
            } else {
                randomValue -= stateInfo.low.possibility;
                
                if (stateInfo.irregular.getCondition() && randomValue < stateInfo.irregular.possibility) {
                    currentState = stateInfo.irregular;
                    console.log("irregular 진입");
                }
            }
        }
    }
    
    const heartRateTemp = currentHeartRate + Math.pow(Math.random(), 2) * currentState.heartRate.maxDeviation * signFactor
        - currentState.heartRate.getRestorationTendency(currentHeartRate - currentState.heartRate.standard);
    
    if (heartRateTemp - currentHeartRate > maxHeartRateDeviation) {
        currentHeartRate += maxHeartRateDeviation;
    } else if (heartRateTemp - currentHeartRate < -maxHeartRateDeviation) {
        currentHeartRate -= maxHeartRateDeviation;
    } else {
        currentHeartRate = heartRateTemp;
    }
    
    if (currentHeartRate > minHeartRateForFetalMovement) {
        isFetusMoved = Math.random() < currentState.fetalMovement.possibility;
    }
    
    return {
        heartRate: currentHeartRate,
        isFetusMoved: isFetusMoved
    };
}

module.exports.generateData = generateData;
module.exports.dataGenPeriod = dataGenPeriod;