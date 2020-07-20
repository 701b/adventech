# 원격 태아 검사 IoT 시스템

## 시스템 구조

전체적인 구조의 모습은 아래 그림에서 확인할 수 있다.

![](.README_images/architecture.png)

### 센서

실제로는 센서를 통해 태아의 심장 박동과 태동을 센서로 측정하는 것이지만,
그렇다고 가정하고 데이터 생성 프로그램(pub-mqtt)을 사용하여 데이터를 생성한다.

### MQTT 통신

MQTT는 IoT를 위한 통신 프로토콜로 저전력, 낮은 패킷량으로 통신한다는 점이 특징이다.
MQTT는 일반적인 통신과는 다르게, 중간에 통신을 중계하는 브로커가 존재한다.

![](.README_images/mqtt.png)

브로커에게 특정 topic에 대해 데이터를 보내면(publish),
브로커는 해당 topic을 구독하는(subscribe) 프로그램에게 데이터를 전송한다.
여기 시스템에서 브로커는 rabbitMQ가 담당하고, 
sub-mqtt 프로그램이 fetal-information이라는 topic에 대해 구독한다.

### sub-mqtt

sub-mqtt 프로그램은 브로커로부터 데이터를 받아 postgresql에 데이터를 저장한다.

### postgresql

postgresql은 데이터베이스로, 현재 할당받은 DB에 fetal_information라는 이름의 schema를 만들고
heart_rate라는 이름의 table을 만들어 데이터를 저장하였다. 
아래 캡쳐는 테이블에 저장된 데이터의 모습이다.

![](.README_images/table.png)

### server

server은 node.js express 프레임워크를 사용한 프로그램으로,
수정을 통해 웹사이트를 개발할 수 있다.

### Dashboard

postgresql에서 데이터를 받아 데이터를 시각화한다.

## 어떻게 구현했는가?

### 파일 출처

파일은 WISE-PaaS Certified Developer-Level II에서 제공하는 파일들을 받아 조금씩 수정하였다.

### 도커 이미지 만들기

쿠버네틱스에 배포할 프로그램은 도커 허브에 이미지를 업로드한 후에
쿠버네틱스에 이미지에 관한 설정 파일을 적용하면 해당 이미지를 다운받아 사용하는 방식이다.

따라서 쿠버네틱스에 배포될 server와 sub-mqtt를 도커 허브에 업로드해야 한다.
각 폴더에서 docker build 명령어를 통해 이미지를 만든다. 이미지 이름은 `{계정}/{이미지이름}:{태그}` 형식으로 작성해야 한다.

```shell script
~/adventech/server> docker build -t vodiakana/fetal-information-server:1.0.0 .
```

만들어진 이미지 파일을 도커 허브에 업로드한다.

```shell script
~/adventech/server> docker push vodiakana/fetal-information-server:1.0.0
```

sub-mqtt도 마찬가지로 해준다.

```shell script
~/adventech/sub-mqtt> docker build -t vodiakana/fetal-information-sub-mqtt:1.0.0 .
~/adventech/sub-mqtt> docker push vodiakana/fetal-information-sub-mqtt:1.0.0
```

### 프로그램 배포하기

이제 도커 이미지 파일 이름을 각 yaml 설정 파일에 넣어야 한다.
image 부분에 방금 업로드한 도커 이미지 파일 이름을 작성한다.

```yaml
[mqtt.yaml]
...
- name: mqtt
  image: vodiakana/fetal-information-sub-mqtt:1.0.0
  imagePullPolicy: Always
...
```

```yaml
[server.yaml]
...
- name: server
  image: vodiakana/fetal-information-server:1.0.0
  imagePullPolicy: Always
...
```

이제 설정 파일을 쿠버네틱스에 적용시킨다.

```shell script
~/adventech> kubectl apply -f k8s/
```

쿠버네틱스에 정상적으로 배포되었는지 확인한다.

```shell script
~/adventech> kubectl get all
```

### 데이터 전송하기

pub-mqtt 프로그램을 실행시켜 데이터를 만들어서 브로커에게 전송한다.
다음 명령어로 실행한다.

```shell script
~/adventech> npm start
```