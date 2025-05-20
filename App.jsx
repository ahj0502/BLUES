import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://openapi.seoul.go.kr:8088/6959417a6b61706c3830424c6e6547/json/GetParkingInfo/1/1000/"
        );
        const json = await res.json();
        const all = json.GetParkingInfo?.row || [];

        const filtered = all.filter((p) =>
          ["한강진", "한남동"].some((keyword) =>
            p.PARKING_NAME.includes(keyword)
          )
        );

        const mapped = filtered.map((p) => ({
          name: p.PARKING_NAME,
          address: p.ADDR,
          available: Number(p.CAPACITY) - Number(p.CUR_PARKING),
          total: Number(p.CAPACITY),
          price: p.RATES + "원 / " + p.TIME_RATE + "분",
        }));

        setData(mapped);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 bg-blue-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-900">공영주차장 실시간 정보</h1>
      <input
        placeholder="주차장 이름 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm p-2 border border-blue-300 rounded"
      />
      {filtered.map((item, index) => (
        <div key={index} className="bg-white shadow-md p-4 rounded border border-blue-100">
          <h2 className="text-xl font-semibold">{item.name}</h2>
          <p>주소: {item.address}</p>
          <p>요금: {item.price}</p>
          <p>
            현재 가능 대수: {item.available} / {item.total} (
            <span
              className={
                item.available > 10
                  ? "text-green-600"
                  : item.available > 3
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {item.available > 10
                ? "여유"
                : item.available > 3
                ? "혼잡"
                : "만차 임박"}
            </span>
            )
          </p>
        </div>
      ))}
    </div>
  );
}