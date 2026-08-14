/* ========================================
   카페온24 매장 데이터
========================================= */

const cafeStores = [
    {
        name: "카페온24 강남역점",
        status: "영업중",
        address: "서울특별시 강남구 테헤란로 123 1층",
        hours: "24시간 연중 무휴",
        phone: "02-1234-5678",

        // 예시 좌표 - 실제 매장 좌표로 변경
        lat: 37.4979,
        lng: 127.0276
    },

    {
        name: "카페온24 역삼점",
        status: "영업중",
        address: "서울특별시 강남구 역삼동",
        hours: "24시간 연중 무휴",
        phone: "02-1234-5679",

        // 예시 좌표
        lat: 37.5005,
        lng: 127.0365
    },

    {
        name: "카페온24 선릉점",
        status: "영업중",
        address: "서울특별시 강남구 선릉로",
        hours: "24시간 연중 무휴",
        phone: "02-1234-5680",

        // 예시 좌표
        lat: 37.5045,
        lng: 127.0490
    },

    {
        name: "카페온24 논현점",
        status: "영업중",
        address: "서울특별시 강남구 논현동",
        hours: "24시간 연중 무휴",
        phone: "02-1234-5681",

        // 예시 좌표
        lat: 37.5107,
        lng: 127.0217
    },

    {
        name: "카페온24 삼성점",
        status: "영업중",
        address: "서울특별시 강남구 삼성동",
        hours: "24시간 연중 무휴",
        phone: "02-1234-5682",

        // 예시 좌표
        lat: 37.5089,
        lng: 127.0631
    }
];


/* ========================================
   DOM Element
========================================= */

const mapContainer = document.getElementById("storeMap");

const storeName = document.getElementById("storeName");
const storeStatus = document.getElementById("storeStatus");
const storeAddress = document.getElementById("storeAddress");
const storeHours = document.getElementById("storeHours");
const storePhone = document.getElementById("storePhone");

const findStoreLink = document.getElementById("findStoreLink");
const detailStoreLink = document.getElementById("detailStoreLink");


/* ========================================
   Kakao Maps API 확인
========================================= */

if (
    typeof kakao === "undefined" ||
    typeof kakao.maps === "undefined"
) {

    mapContainer.innerHTML = `
        <div class="store-map__error">
            Kakao Maps API를 불러올 수 없습니다.<br>
            JavaScript Key와 등록된 도메인을 확인해주세요.
        </div>
    `;

} else {

    /* ========================================
       Kakao Map 실행
    ========================================= */

    initCafeMap();
}


/* ========================================
   Kakao Map 초기화
========================================= */

function initCafeMap() {

    /* 첫 번째 매장을 기본 중심 위치로 지정 */
    const firstStore = cafeStores[0];

    const mapCenter = new kakao.maps.LatLng(
        firstStore.lat,
        firstStore.lng
    );


    /* ========================================
       Kakao Map 생성
    ========================================= */

    const mapOptions = {
        center: mapCenter,

        /* 숫자가 작을수록 확대 */
        level: 5
    };


    const map = new kakao.maps.Map(
        mapContainer,
        mapOptions
    );


    /* 생성된 Marker Button 저장 */
    const markerButtons = [];


    /* ========================================
       매장 Marker 생성
    ========================================= */

    cafeStores.forEach(function (store, index) {

        /* Marker 위치 */
        const markerPosition = new kakao.maps.LatLng(
            store.lat,
            store.lng
        );


        /* ========================================
           Marker HTML Button 생성
        ========================================= */

        const markerButton = document.createElement("button");

        markerButton.type = "button";

        markerButton.className = "store-map-marker";

        markerButton.setAttribute(
            "aria-label",
            store.name + " 매장 선택"
        );


        /* ========================================
           Marker Image 생성
        ========================================= */

        const markerImage = document.createElement("img");

        markerImage.src = "./images/line-md_map-marker-radius-filled.svg";

        /* 이미지 대체문자 */
        markerImage.alt = store.name + " 위치 마커";


        markerButton.appendChild(markerImage);


        /* Marker Button 저장 */
        markerButtons.push(markerButton);


        /* ========================================
           Kakao Custom Overlay 생성
        ========================================= */

        const overlay = new kakao.maps.CustomOverlay({

            map: map,

            position: markerPosition,

            content: markerButton,

            /* 마커 클릭 시 지도 클릭 이벤트 방지 */
            clickable: true,

            /* 가로 중앙 */
            xAnchor: 0.5,

            /* 마커 하단이 좌표에 위치 */
            yAnchor: 1
        });


        /* ========================================
           Marker Click
        ========================================= */

        markerButton.addEventListener(
            "click",
            function () {

                selectStore(
                    index,
                    map,
                    markerButtons
                );

            }
        );
    });


    /* ========================================
       최초 매장 정보 출력
    ========================================= */

    selectStore(
        0,
        map,
        markerButtons,
        false
    );
}


/* ========================================
   선택한 매장 정보 변경
========================================= */

function selectStore(
    index,
    map,
    markerButtons,
    moveMap = true
) {

    const selectedStore = cafeStores[index];


    /* ========================================
       왼쪽 Card 내용 변경
    ========================================= */

    storeName.textContent =
        selectedStore.name;

    storeStatus.textContent =
        selectedStore.status;

    storeAddress.textContent =
        selectedStore.address;

    storeHours.textContent =
        selectedStore.hours;

    storePhone.textContent =
        selectedStore.phone;


    /* ========================================
       Kakao Map 바로가기 설정
    ========================================= */

    const encodedStoreName =
        encodeURIComponent(selectedStore.name);


    /* 길찾기 */
    findStoreLink.href =
        `https://map.kakao.com/link/to/` +
        `${encodedStoreName},` +
        `${selectedStore.lat},` +
        `${selectedStore.lng}`;


    /* 지도에서 매장 상세 위치 보기 */
    detailStoreLink.href =
        `https://map.kakao.com/link/map/` +
        `${encodedStoreName},` +
        `${selectedStore.lat},` +
        `${selectedStore.lng}`;


    /* ========================================
       Marker Active 처리
    ========================================= */

    markerButtons.forEach(
        function (button, markerIndex) {

            button.classList.toggle(
                "is-active",
                markerIndex === index
            );

        }
    );


    /* ========================================
       선택한 매장으로 지도 이동
    ========================================= */

    if (moveMap) {

        const movePosition =
            new kakao.maps.LatLng(
                selectedStore.lat,
                selectedStore.lng
            );


        map.panTo(movePosition);
    }
} 