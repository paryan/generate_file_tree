//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const _ = require('lodash')

function flattenObject (ob) {
  let T = this;
  let toReturn = {};

  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object') {
      let flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function getFilesInFolder (fPath, index=0) {
  let fList = fs.readdirSync(fPath)
  fList = _.chain(fList).filter(x => x[0] !== '.' && !x.match(/node_modules/) && !x.match(/\.json/) && !['data', 'logs'].includes(x)).sort().value()
  let fList2 = []
  let final = []
  for (let i = 0; i < fList.length; i++) {
    let __path = (fPath.slice(-1) === '/' ? fPath : fPath + '/') + fList[i]
    let isFolder = fs.lstatSync(__path).isDirectory()
    let fObj = {
      name: (isFolder ? (fList[i].slice(-1) === '/' ? fList[i] : fList[i] + '/') + fList[i] :fList[i]),
      absPath: __path,
      relPath: (isFolder ? (__path.slice(-1) === '/' ? __path : __path + '/') + __path :__path),
      isFolder,
      isFolder2:isFolder?1:2,
      name2:(isFolder ? (fList[i].slice(-1) === '/' ? fList[i] : fList[i] + '/') + fList[i] :fList[i]).toLowerCase(),
      index,
      treePath: '├─' + '─'.repeat(index * 4) + ' ' + (isFolder ? '\\' : '') + __path.replace(fPath, ''),
    }

    fList2.push(fObj)
  }

  fList2 = _.chain(fList2).sortBy(['isFolder2', 'name2']).value()

  for (let i = 0; i < fList2.length; i++) {
    let fObj = fList2[i]
    if (fObj.isFolder) {
      let __path2 = (fObj.absPath.slice(-1) === '/' ? fObj.absPath : fObj.absPath + '/')
      let B2 = getFilesInFolder(__path2, index + 1)
      fObj.children = B2
    }
    final.push(fObj)
  }

  return final
}

;(async function () {
  try {
    let F_PATH = '~/' || __dirname
    let BASE = F_PATH.slice(-1) === '/' ? F_PATH : F_PATH + '/'
    let folderName = F_PATH.split(/\//).slice(-1)[0]
    let B = getFilesInFolder(BASE)
    B = _.chain(flattenObject(B)).map((x, i) => ({key:i, val:'  ' + x})).filter(x => x.key.match(/tree/i)).map('val').join('\n').value()
    console.log('\\' + folderName)
    console.log(B)

  } catch (e) {
    console.log(e)
  }
}).call(this)
