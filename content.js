var CLFSelect = document.createElement('select')
CLFSelect.id = 'CLFSelect'
var CLFFooter = document.createElement('h2')
CLFFooter.id = 'CLFFooter'
var CLFHeader = document.createElement('h2')
CLFHeader.id = 'CLFHeader'
var CLFShown = false
var loc = window.location.href
var commentNum = 0
var shownCommentNum = 0
var addShow = false;
var wordShow = false;
var userwords = '';

var observer = new MutationObserver((mutationList) => {
  removeComments()
})

function containsSelectedLang(string, StartCharset, EndCharset) {
  var stlen = string.length
  var i = 0
  for (i = 0; i < stlen; i++) {
    for (var x = 0; x < StartCharset.length; x++) {
      if (StartCharset[x] <= string.charCodeAt(i) && string.charCodeAt(i) <= EndCharset[x]) {
        return true
      }
    }
  }
  console.log("blocked by language")
  return false
}

function addChecker(toCheckString){
    const newregex = new RegExp('마크', 'gi')
    var checker = newregex.test(toCheckString)
    if (checker === true){
        console.log("blocked by abuse and add")
    }
    return checker
}

function wordChecker(toCheckString)
{
    const wordregex = new RegExp(userwords, 'gi')
    var checker = wordregex.test(toCheckString)
    if (checker === true){
        console.log("blocked by word")
    }
    
    return checker
}
function onlyShow(StartCharset, EndCharset) {
  var commentList = document.getElementsByTagName('ytd-comment-thread-renderer')
  for (var i = commentNum; i < commentList.length; i++) {
    commentNum++
    CLFFooter.textContent = shownCommentNum + ' / ' + commentNum
    var commentString = commentList[i].querySelector('#content-text').innerText
    console.log(commentString)
    // console.log("should be false", addShow)
    // console.log("userword", userwords);
    // console.log("show be same as ", wordShow)
    if (!containsSelectedLang(commentString, StartCharset, EndCharset)||!addShow && addChecker(commentString)||!wordShow && wordChecker(commentString)) {
      commentList[i].style = 'display: none'
    } else {
      shownCommentNum++
    }
  }
}

function showAllComments() {
  commentNum = 0
  shownCommentNum = 0
  var commentList = document.getElementsByTagName('ytd-comment-thread-renderer')
  for (var comment of commentList) {
    comment.style = ''
  }
}

function removeComments() {
  if (CLFSelect.value == 'All') {
    CLFFooter.textContent = '마지막 댓글입니다.'
  } else if (CLFSelect.value == 'English') {
    onlyShow([65, 97], [90, 122])
  } else if (CLFSelect.value == 'Korean') {
    onlyShow([0xac00], [0xd7a3])
  } else if (CLFSelect.value == 'Japanese') {
    onlyShow([0x3040], [0x30ff])
  } else if (CLFSelect.value == 'Chinese') {
    onlyShow([0x4e00], [0x9fff])
  }
}

async function main(loc) {
  if (loc.substring(0, 29) == 'https://www.youtube.com/watch') {
    if (!CLFShown) {
      chrome.storage.sync.get(
        ['EnglishDisabled', 'KoreanDisabled', 'JapaneseDisabled', 'ChineseDisabled', 'addDisabled','userWords', 'wordDisabled'],
        (result) => {
          var AllSelect = document.createElement('option')
          AllSelect.value = 'All'
          AllSelect.innerHTML = '모든 언어'
          addShow = !result.addDisabled
          wordShow = !result.wordDisabled
          userwords = result.userWords
          CLFSelect.appendChild(AllSelect)
          if (!result.EnglishDisabled) {
            var EnglishSelect = document.createElement('option')
            EnglishSelect.value = 'English'
            EnglishSelect.innerHTML = '영어(English)'
            CLFSelect.appendChild(EnglishSelect)
          }
          if (!result.KoreanDisabled) {
            var KoreanSelect = document.createElement('option')
            KoreanSelect.value = 'Korean'
            KoreanSelect.innerHTML = '한글(Korean)'
            CLFSelect.appendChild(KoreanSelect)
          }
          if (!result.JapaneseDisabled) {
            var JapaneseSelect = document.createElement('option')
            JapaneseSelect.value = 'Japanese'
            JapaneseSelect.innerHTML = '일어(Japanese)'
            CLFSelect.appendChild(JapaneseSelect)
          }
          if (!result.ChineseDisabled) {
            var ChineseSelect = document.createElement('option')
            ChineseSelect.value = 'Chinese'
            ChineseSelect.innerHTML = '중어(Chinese)'
            CLFSelect.appendChild(ChineseSelect)
          }
        }
      )
      CLFHeader.classList.add('select-text')
      CLFHeader.classList.add('CLFHeader')
      CLFFooter.classList.add('CLFFooter')
      CLFHeader.textContent = '이 언어로 된 댓글 볼래요!'
      CLFFooter.textContent = '마지막 댓글입니다.'
      ;(function insertEl() {
        var meta = document.evaluate(
          '/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[7]',
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue
        var primary = document.evaluate(
          '/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]',
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue
        if (
          meta != null &&
          meta.className != undefined &&
          primary != null &&
          primary.className != undefined
        ) {
          meta.append(CLFHeader)
          meta.append(CLFSelect)
          primary.append(CLFFooter)
          CLFShown = true
        } else {
          setTimeout(insertEl, 200)
        }
      })()
      CLFSelect.addEventListener('change', function () {
        if (CLFSelect.value == 'All') {
          CLFFooter.textContent = '마지막 댓글입니다.'
          observer.disconnect()
          showAllComments()
        } else {
          const config = {
            attributes: false,
            childList: true,
            subtree: true,
          }
          const target = document.evaluate(
            '/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/ytd-comments/ytd-item-section-renderer/div[3]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue
          showAllComments()
          removeComments()
          observer.observe(target, config)
        }
      })
    }
    showAllComments()
    removeComments()
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'page moved!') {
    loc = request.url
    main(loc)
    CLFFooter.textContent = '마지막 댓글입니다.'
    document.getElementById('CLFSelect').selectedIndex = 0
    showAllComments()
    observer.disconnect()
  }
})

main(loc)