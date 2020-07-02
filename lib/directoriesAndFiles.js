'use strict'

const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const fileExtension = require('file-extension')

const {
  COMPILE_FILES,
  IGNORE_FILES
} = require('./constants')

async function createDirectoriesAndFiles (templatePath, newPath, options) {
  return new Promise((resolve, reject) => {
    const args = [...arguments]
    if (typeof templatePath === 'undefined' ||
      newPath === 'undefined' || typeof options === 'undefined') {
      reject(new Error(
        "Failed to execute 'createDirectoriesAndFiles': " +
        `3 arguments required, but only ${args.length} present.`
      ))
    }
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] !== 'string' && i < 2) {
        reject(new Error(
          "Failed to execute 'createDirectoriesAndFiles' " +
          `The ${i + 1} parameter must be string`
        ))
      }
      if (typeof args[i] !== 'object' && i === 2) {
        reject(new Error(
          "Failed to execute 'createDirectoriesAndFiles' " +
          `The ${i + 1} parameter must be object`
        ))
      }
    }

    try {
      createDirectoriesAndFilesRecursive(templatePath, newPath, options)
      resolve()
    } catch (e) {
      reject(new Error(`This directory already exists: ${newPath}`))
    }
  })
}

function createDirectoriesAndFilesRecursive (templatePath, newPath, options) {
  fs.mkdirSync(newPath)
  const filesToCreate = fs.readdirSync(templatePath, { encoding: 'utf8', withFileTypes: true })

  filesToCreate.forEach(async stats => {
    const currentPath = `${newPath}/${stats.name}`
    const filePath = path.join(templatePath, stats.name)
    const fileExt = fileExtension(stats.name)

    if (stats.isFile()) {
      const readFile = fs.readFileSync(filePath, 'utf8')
      if (COMPILE_FILES.includes(fileExt)) {
        const str = ejs.compile(readFile)(options)
        fs.writeFileSync(currentPath, str, 'utf8')
      } else if (!IGNORE_FILES.includes(fileExt)) {
        fs.writeFileSync(currentPath, readFile, 'utf8')
      }
      return
    }
    createDirectoriesAndFilesRecursive(filePath, currentPath, options)
  })
}

module.exports = {
  createDirectoriesAndFiles
}