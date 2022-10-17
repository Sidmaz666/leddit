function toggleNavMenu() {
  const e = document.querySelector("#nav_menu");
  e.classList.toggle("hidden");
}

function toggleLoader(){
 document.querySelector('#loader').classList.toggle('hidden')
}

const base_url = "https://teddit.net/?api&type=json"
const proxy_url ="https://corsanywhere.herokuapp.com/"

async function summonJSON(url){
	const req = await axios(proxy_url+url)
  	const data = await req.data
  	return data
}

function createCards(parentElm,type,title,author,link,subreddit){
const main = document.querySelector(parentElm)
const cardDiv = document.createElement('div')
cardDiv.setAttribute('class', "flex flex-col space-y-3 bg-black/50 p-2 pb-5 rounded-md md:w-96 capitalize")
const span_1 = document.createElement('span')
const span_2 = document.createElement('span')
span_1.setAttribute('class', "text-2xl font-bold ")
span_2.setAttribute('class', "text-sm font-semibold opacity-80 italic")
span_1.textContent = title
span_2.textContent = "By " + author + " from r/" + subreddit
let media
  if(type == "img"){
    media = document.createElement('img')
    media.src = link
  } 

  if(type == "video"){
   media = document.createElement('video')
   media.setAttribute('controls','')
   media.setAttribute('muted','')
   const media_v = document.createElement('source')
   media_v.type = "video/mp4"
   media_v.src = link
   media.appendChild(media_v)
  } 


cardDiv.appendChild(span_1)
cardDiv.appendChild(span_2)
cardDiv.appendChild(media)
main.appendChild(cardDiv)

}

function renderJSON(array){
  Array.from(array).forEach((data) => {
    	let type,link
    	if(data.is_video && data.media.reddit_video.scrubber_media_url){
	 type = "video"
	 id = data.media.reddit_video.scrubber_media_url.replace('https://v.redd.it/','').replace('/DASH_96.mp4','')
	 link = `https://teddit.net/vids/${id}.mp4`
	} else {
	  if(data.images !== null && data.images.preview){
	  type = "img"
	  link = "https://teddit.net/" + data.images.preview
	  }
	}

    	if(type){
	  createCards('#content', type, data.title, data.author, link, data.subreddit)
    	}
  })

}

let afterId,lastURL

async function loadMore(lastURL){
    const {info,links} = await summonJSON(lastURL + `&t=&after=${afterId}`)
    afterId = info.after
    renderJSON(links)
}

//Run on Windows onload
document.addEventListener("DOMContentLoaded",async function() {
  const {info,links} = await summonJSON(base_url)
  afterId = info.after
  lastURL = base_url
  renderJSON(links)
  toggleLoader()
//Infinite Scroll
window.addEventListener('scroll', function(){
  const {scrollHeight,scrollTop,clientHeight} = document.documentElement
  if(scrollTop + clientHeight >= scrollHeight - 1000){
    if(afterId){

      setTimeout(() =>{
      	loadMore(lastURL)
      },300)

    }
  }

})

});

function removeAllChildren(theParent){
    var rangeObj = new Range();
    rangeObj.selectNodeContents(theParent);
    rangeObj.deleteContents();
}


async function renderSubreddit(subreddit,isR){
 	toggleLoader()
  	removeAllChildren(document.querySelector('#content'))
	const para = subreddit.replace('/r' ,'').replaceAll(' ','')
  	let link 
	if(isR){
  	link = base_url.replace('/?api', `/r/${para}/?api`)
	} else {
  	link = base_url.replace('/?api', `/${para}/?api`)
	}
	const {info,links} = await summonJSON(link)
	afterId = info.after
	lastURL = link
	renderJSON(links)
  	toggleLoader()
}

