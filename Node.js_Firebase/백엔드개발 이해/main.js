// "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import { db } from "./firebase.js"

import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const temperatureInput = document.querySelector("#temperatureInput");
const humidityInput = document.querySelector("#humidityInput");
const submitButton = document.querySelector("#submitButton");
const sensorList = document.querySelector("#sensor-list");
// sensor_logs -> 콜렉션 이름

submitButton.addEventListener("click", async() => {
    try {
        const temperature = parseFloat(temperatureInput.value);
        const humidity = parseFloat(humidityInput.value);
        // 0, null, undefined -> false
        if (isNaN(temperature) || isNaN(humidity)) {
            alert("유효한 온도와 습도 값을 입력하세요.");
            return;
        }

        // 문서 추가
        await addDoc(collection(db, "sensor_logs"), {
            temperature: temperature,
            humidity,
            created_time: new Date()
        });
    } catch (error) {

    }
})



const q = query(collection (db, "sensor_logs"), orderBy("created_time", "desc"));
// 실시간으로 데이터를 가져오는 기능
onSnapshot(q, (snapshot) => {
    sensorList.innerHTML = ""; // 기존 목록 초기화
    snapshot.forEach(doc => {
        console.log(doc.data());
        sensorList.insertAdjacentHTML("beforeend", `
            <div>
            온도: <strong>${doc.data().temperature}</strong>
            / 습도: <strong>${doc.data().humidity}</strong>
            / 시간: <strong>${doc.data().created_time.toDate().toLocaleString()}</strong>
            </div>
            <hr/>
            `)
    
    });
})