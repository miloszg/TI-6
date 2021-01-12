import React, { useCallback, useEffect, useState } from "react";
import "./App.css";

function App() {
  const [jsonData, setData] = useState(null);
  const [updateInfo, setUpdateInfo] = useState("");

  const getData = useCallback(() => {
    let cacheTime = localStorage.getItem("cache-time");
    let cacheData = JSON.parse(localStorage.getItem("cache-data"));
    let cacheTimer = localStorage.getItem("cache-timer"); // cache-control max-age
    if (
      cacheData &&
      Number(cacheTime) + Number(cacheTimer) > new Date().getTime()
    ) {
      setUpdateInfo(`Data is up to date ${new Date().toUTCString()}`);
      setData(cacheData);
    } else {
      fetch("https://jsonplaceholder.typicode.com/todos/1")
        .then((response) => {
          let timer = response.headers.get("Cache-control").match(/\d+/)[0]; // cache-control max-age
          localStorage.setItem("cache-timer", timer);
          return response.json();
        })
        .then((data) => {
          if (cacheTime) {
            if (Number(cacheTime) + Number(cacheTimer) < new Date().getTime()) {
              // needs an update (data expired)
              localStorage.setItem("cache-time", new Date().getTime());
              localStorage.setItem("cache-data", JSON.stringify(data));
              setData(data);
              setUpdateInfo(`Data was updated ${new Date().toUTCString()}`);
            } else {
              // no update required
              setUpdateInfo(`Data is up to date ${new Date().toUTCString()}`);
            }
          } else {
            // no data
            setData(data);
            setUpdateInfo(`Data was created ${new Date().toUTCString()}`);
            localStorage.setItem("cache-data", JSON.stringify(data));
            localStorage.setItem("cache-time", new Date().getTime());
          }
        });
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 5000);
    return () => clearInterval(interval);
  }, [getData]);

  return (
    <div className="App">
      <header className="App-header">
        <h3>{updateInfo}</h3>
        {/* {Object.entries(jsonData).map((element, i) => (
          <p key={i}>{`${i}: ${element}`}</p>
        ))} */}
        {jsonData ? JSON.stringify(jsonData) : null}
      </header>
    </div>
  );
}

export default App;
