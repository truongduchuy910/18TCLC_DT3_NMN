const express = require('express')
const path = require('path')
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 5000
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/webhook', function (req, res) {
  res.send('Fuckyou Facebook');
})
app.get('/getNotifications', async(req, res) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://sv.dut.udn.vn/G_Thongbao.aspx');
  
  //Get data from website
  var data = await page.evaluate(() => {
    //nạp  HTML vào body để xử lí và nạp body đã xử lí vào ngược lại HTML
    var body = document.querySelectorAll('body')[0].innerHTML;
    body = '<div>' + body + '</div>';
    body = body.replace(/<p class="MsoNormal">/g, '</div> <div class = "notification"> <p class="MsoNormal">');
    document.querySelectorAll('body')[0].innerHTML = body;
    //brower console: lấy dữ liệu web lưu vào biến data
    var listDivNotification = document.querySelectorAll('div.notification');
    listDivNotification = [...listDivNotification];
    listDivNotification.reverse();
    let list= []    ; 
    for (var i = 0;i < listDivNotification.length;i++) {
        var listLink = listDivNotification[i].querySelectorAll('a');
        var collectLink = [];
        for (var j = 0; j < listLink.length;j++) {
            collectLink.push({
                content: listLink[j].innerText,
                url: listLink[j].href
            });
        };
        var dateNotification = listDivNotification[i].querySelectorAll('p.MsoNormal>b')[0].textContent;
        var titleNotification = listDivNotification[i].querySelectorAll('p.MsoNormal>span')[0].textContent;
        var contentNotification = listDivNotification[i].innerText;                
                      
        list.push({
            date: dateNotification,
            title: titleNotification,
            content: contentNotification, //include data, title, content
            link: collectLink,
        });
      };     
      return {'list':list};          
  })
  await reponse.send(data);
  await browser.close();
})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))