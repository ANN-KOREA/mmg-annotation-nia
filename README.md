# MMG Annotation-nia
mmg-annotation-nia mammography를 annotation할 수 있는 도구입니다.

## Prerequisites
mmg-annotation을 실행시키기 위해선 사전 준비가 필요합니다.  
Docker-compose 명령어로 프로젝트를 실행할 수 있도록 Docker를 본인의 OS에 맞게 설치합니다.  
mmg-annotation은 Docker(ver. 19.03.2), Docker-compose(ver. 1.24.1)의 환경에서 정상적으로 실행됩니다.  
mmg-annotation을 사용하기 위해서 DICOM 영상 이미지를 준비합니다.   

- Docker 설치 
- DICOM 영상 이미지(LCC, LMLO, RCC, RMLO) 준비 

## Environment settings
1. mmg-annotation의 Repository를 clone 합니다.
```
https://github.com/lunit-io/mmg-annotation-nia.git
``` 
2. mmg-annotation 디렉토리 아래에 data 디렉토리를 생성합니다.  

3. 준비한 DICOM 영상 이미지를 넣어줍니다.  
아래의 구조도를 참고하여 data 디렉토리 아래에 하위 디렉토리를 생성하고 적절한 위치에 준비한 DICOM 영상 이미지를 넣어줍니다.  
현재, 두가지 케이스는 이미지만 추가하여도 테스트가 가능하도록 준비되어 있습니다.   
```
mmg-annotation
    - apps
    - conf
    - data
        - dicom
            - test
                - 1
                    - LCC.dcm
                    - LMLO.dcm
                    - RCC.dcm
                    - RMLO.dcm
                - 2
                    - LCC.dcm
                    - LMLO.dcm
                    - RCC.dcm
                    - RMLO.dcm
        - Result
    ... (생략)
```
4. 좀더 많은 케이스 추가하려면 test 디렉토리 아래에 새로운 디렉토리를 생성하고 DICOM 이미지를 넣어줍니다.  
그 다음 run/mysql/mmg_annotation.sql에서 테이블 case_info, user_case_map에 해당 정보를 업데이트 해줍니다. 

```
// case_info 추가
INSERT INTO `case_info` (case_path, created_at) VALUES ('test/폴더명' , NOW());


// user_case_map 추가 (User와 Case 연결)
INSERT INTO `user_case_map` (user_id, seq, case_id, task_type, created_at) VALUES (1,3,3,'LA',NOW());
```
 
## Run
1. 다음의 명령어를 실행합니다.
```
    docker-compose up --build -d
```

2. Chrome에서 아래 주소로 접속 합니다.
```
    localhost:8088
```

3. 아래의 계정으로 로그인 합니다.
```
    ID : test
    Password : test
```

## How it works
마우스 왼쪽을 더블 클릭하면 마우스를 annotation이 가능한 cancer 모드로 변경할 수 있습니다. (pen mode <=> cancer mode)    
다음 케이스로 이동하면 현재의 annotation한 결과가 json 파일로 저장됩니다.  

## Result
annotaion한 결과는 케이스별로 json 파일에 저장합니다.  
json 파일에는 다음과 같은 값을 저장합니다.

|  key			|  Descprtion 		  | 
|---------------|---------------------|
|  case_id 	    | case의 id			   |
|  user_id	    | 해당 케이스 담당자의 id  |
|  discard_yn	| 판독 가능한 케이스인지 여부|
|  contour_list	| annotation한 좌표들    |

data 디렉토리에 아래에 User 별로 User의 ID로 디렉토리가 추가로 생성되며, 해당 디렉토리 아래에 case의 id를 이름으로 하는 json 파일을 생성합니다.  
예를 들어, 1번 user에게 할당된 case 1,2에 대한 annotation한 결과는 아래와 같습니다. 
```
mmg-annotation
    - apps
    - conf
    - data
        - dicom
        - result
            -1
                - 1.json
                - 2.json
    ... (생략)
```

