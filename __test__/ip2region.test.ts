// 创建一个tst测试文件
import { newWithFileOnly } from "../src/index";
test("ip2region", async () => {
  const ip2Region = newWithFileOnly();
  const data = await ip2Region.search("121.9.142.184");
  console.log(data);

  expect(data.region).toEqual("中国|0|广东省|佛山市|电信");
});
