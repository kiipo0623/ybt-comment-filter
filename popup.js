window.onload = () => {
    document.querySelector('#removeword').addEventListener('change', function () {
        var user = document.querySelector('#removeword').value
        chrome.storage.sync.set({
            userWords: user
        })
        chrome.storage.sync.get('userWords', function (result) {
            console.log(result)
            document.querySelector('#storagedword').innerText = result.userWords
        })
    })
    document.getElementById('save-button').addEventListener('click', function () {
      storeSetting()
    })
    checkSetting()
  }
  
  function storeSetting() {
    const EnglishDisabled = !document.getElementById('lang-english-checkbox').checked
    const KoreanDisabled = !document.getElementById('lang-korean-checkbox').checked
    const JapaneseDisabled = !document.getElementById('lang-japanese-checkbox').checked
    const ChineseDisabled = !document.getElementById('lang-chinese-checkbox').checked
    const addDisabled = document.getElementById('add-checkbox').checked
    const wordDisabled = document.getElementById('word-checkbox').checked
    const setting = {
      EnglishDisabled: EnglishDisabled,
      KoreanDisabled: KoreanDisabled,
      JapaneseDisabled: JapaneseDisabled,
      ChineseDisabled: ChineseDisabled,
      addDisabled: addDisabled,
      wordDisabled: wordDisabled,
    }
    console.log(setting)
    chrome.storage.sync.set(setting, () => {
      console.log('Stored', setting)
      document.getElementById('save-button').innerHTML = 'Saved!'
      setTimeout(function () {
        document.getElementById('save-button').innerHTML = 'Save'
      }, 2000)
    })
  }
  
  function checkSetting() {
    chrome.storage.sync.get(
      [
        'EnglishDisabled',
        'KoreanDisabled',
        'JapaneseDisabled',
        'ChineseDisabled',
        'addDisabled',
        'wordDisabled',
      ],
      (result) => {
        document.getElementById('lang-english-checkbox').checked = !result.EnglishDisabled
        document.getElementById('lang-korean-checkbox').checked = !result.KoreanDisabled
        document.getElementById('lang-japanese-checkbox').checked = !result.JapaneseDisabled
        document.getElementById('lang-chinese-checkbox').checked = !result.ChineseDisabled
        document.getElementById('add-checkbox').checked = result.addDisabled
        document.getElementById('word-checkbox').checked = result.wordDisabled
      }
    )
  }
  