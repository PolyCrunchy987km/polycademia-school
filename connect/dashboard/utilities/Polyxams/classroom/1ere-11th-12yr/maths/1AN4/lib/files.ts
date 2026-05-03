import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
import {
  buildImagesUrlsList,
  doesLatexNeedsPics,
  getExosContentList,
  getPicsNames,
} from './Latex'
import { type latexFileType } from './LatexTypes'
import type { IExercice, IExerciceStatique } from './types'

export function downloadZip(filesUrls: string[], zipFileName: string) {
  const zip = new JSZip()
  let count = 0
  filesUrls.forEach((url) => {
    JSZipUtils.getBinaryContent(url, (err: Error | null, data: ArrayBuffer | null) => {
      if (err) {
        throw err
      }
      const splitUrl = url.split('/')
      const fileName = splitUrl[splitUrl.length - 1]
      zip.file(fileName, data ?? '', { binary: true })
      count++
      if (count === filesUrls.length) {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, zipFileName)
        })
      }
    })
  })
}

/**
 * Construit l'archive ZIP contenant le code LaTeX et tous les fichiers images nécessaires pour la compilation du code LaTeX
 * @param {string} zipFileName nom donné pour l'archive
 * @param {Latex} latex objet Latex contenant les données des exercices
 * @param {LatexFileInfos} filesInfo paramètres du fichier LaTeX à générer
 * @author sylvain
 */
export async function downloadTexWithImagesZip(
  zipFileName: string,
  latexFile: latexFileType,
  exercices: (IExercice | IExerciceStatique)[],
) {
  const zip = new JSZip()
  const withImages = doesLatexNeedsPics(latexFile.contents)
  const exosContentList = getExosContentList(exercices)
  const picsNames = getPicsNames(exosContentList)
  zip.file('main.tex', latexFile.latexWithPreamble)
  if (withImages) {
    const urls = buildImagesUrlsList(exosContentList, picsNames)
    const imagesFolder = zip.folder('images')
    let count = 0
    urls.forEach((url) => {
      JSZipUtils.getBinaryContent(url, (err: Error | null, data: ArrayBuffer | null) => {
        if (err) {
          throw err
        }
        const splitUrl = url.split('/')
        const fileName = splitUrl[splitUrl.length - 1]
        imagesFolder?.file(fileName, data ?? '', { binary: true })
        count++
        if (count === urls.length) {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            // saveAs(content, [archiveName.replace(/\.(?:.*)$/g, ""), "zip"].join("."))
            saveAs(content, [zipFileName, 'zip'].join('.'))
          })
        }
      })
    })
  } else {
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, [zipFileName, 'zip'].join('.'))
    })
  }
}

export async function downloadFile(
  content: string,
  fileName: string,
): Promise<'success' | 'error'> {
  try {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
    element.setAttribute('download', fileName)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  } catch (error) {
    console.error('Impossible de télécharger le fichier', error)
    return 'error'
  }
  return 'success'
}
