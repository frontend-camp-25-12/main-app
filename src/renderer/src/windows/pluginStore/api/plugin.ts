export async function getPluginInfoByPage(page) {
  const res = await fetch(
    `http://localhost:8080/plugin-info/page=${page}`
  ).then((res) => res.json())
  return res
}

export async function getPluginInfoById(id) {
  const res = await fetch(`http://localhost:8080/plugin-info/id=${id}`).then(
    (res) => res.json()
  )
  return res.data
}
