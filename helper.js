async function getDataOnJsonFile() {
  let res1 = await fetch("./bike1.json");
  let res2 = await fetch("./bike2.json");
  let data1 = await res1.json();
  let data2 = await res2.json();
  console.log(data1.length);
  console.log(data2.length);
}

await getDataOnJsonFile();
