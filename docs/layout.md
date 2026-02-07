전체 레이아웃 구조 (Vertical Stack)
전체적으로 수직(Column) 방향의 Flex 구조를 가지고 있으며, 상단과 하단은 고정(Fixed/Sticky)되고 가운데 콘텐츠 영역만 스크롤되는 전형적인 App Shell 구조입니다.

영역별 상세 분석
① Top App Bar (헤더)
구성: Flex Row (좌측 정렬 + 중앙 정렬 + 우측 정렬)
요소:
Left: 햄버거 메뉴 아이콘, 검색(돋보기) 아이콘
Center: 페이지 타이틀 ("DoTo")
Right: 추가 버튼 (+)
특징: 상단에 고정(position: sticky or fixed)되어 스크롤 시에도 유지될 것으로 보입니다.

② User Stats Section (캐릭터 상태창)
구성: Grid 또는 Flex Row
Layout:
좌측 (Avatar): 픽셀 아트 캐릭터 이미지 (Box 형태)
우측 (Stats): 수직 스택(Flex Column)으로 구성됨.
Row 1: 체력 바 (Health) - Progress Bar (Red)
Row 2: 경험치 바 (Experience) - Progress Bar (Yellow)
하단 (Currency): 레벨, 골드 정보가 Flex Row (justify-between 또는 gap 사용)로 배치됨

③ Glol Banner (Goal 배너)
구성: 카드 형태의 컴포넌트 (Border, Border-Radius, Padding 적용)
내용:
배경에 은은한 그래픽 패턴 존재.
제목(project 명)과 보상(골드 아이콘)이 Flex Row (justify-between)로 배치
하단에 진행률 바(Progress Bar)

⑤ Bottom Navigation Bar (하단 탭바)
구성: Fixed Bottom, Flex Row (justify-content: space-around 또는 evenly)
요소: 5개의 아이콘 탭. (Goal, Project, daily, habit & task, log)
현재 활성화된 탭(Goal)은 파랑색 배경 박스로 강조됨 (Active State).
