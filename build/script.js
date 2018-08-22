const fs = require('fs')
const path = require('path')
const lx = require('escape-latex')

const sourcePath = path.join(__dirname, '/source/source.json')
const templateString = '##CONTENT##'

const templatePath = {
  tex: path.join(__dirname, '/source/template.tex'),
  html: path.join(__dirname, '/source/template.html')
}

const outputPath = {
  tex: path.join(__dirname, '/out/output.tex'),
  html: path.join(__dirname, '/out/output.html')
}

const recipeFile = fs.readFileSync(sourcePath)
let recipes = JSON.parse(recipeFile).content.recipes
  .sort(function (a, b) {
    let ca = a.title.toUpperCase().charCodeAt(0)
    let cb = b.title.toUpperCase().charCodeAt(0)
    return (ca - cb)
  })

let recipesTex = recipes.map(recipeToTex).join('')
let recipesHtml = recipes.map(recipeToHtml).join('')

function wrapInItemize (string) {
  if (string.length === 0) {
    return ''
  } else {
    return `
      \\begin{itemize}[noitemsep]${string}
      \\end{itemize}
    `
  }
}

function recipeToTex (recipe) {
  let ingredientsHeader = `
      \\section{${lx(recipe.title)}}
      \\paragraph{${lx(recipe.description)}}
      \\subsection{Zutaten}`

  let preparationHeader = `
      \\subsection{Zubereitung}`

  let ingredientsPartial = recipe.ingredients
    .map(function (ingredient) {
      return `
        \\item ${lx(ingredient.amount)} ${lx(ingredient.unit)} ${lx(ingredient.name)}`
    })
    .join('')

  let preparationPartial = recipe.preparation
    .map(function (step) {
      return `
        \\item ${lx(step.description)}`
    })
    .join('')

  return ingredientsHeader +
    wrapInItemize(ingredientsPartial) +
    preparationHeader +
    wrapInItemize(preparationPartial)
}

function recipeToHtml (recipe, index) {
  return `
    <section class="recipe">
      <p class="page--number">${index + 1}</p>
      <h1 class="recipe--title">${recipe.title}</h1>
      <p class="recipe--description">
        <span class="recipe--description-text">
          ${recipe.description}
        </span>
        <br/>
        <span class="recipe--vegetarian-info">
          Ein ${recipe.vegetarian ? 'vegetarisches ' : ''}
          Rezept für ${recipe.portions} Portion(en).
        </span>
      </p>

      <h3 class="ingredients--title">Zutaten</h3>
      <ul class="ingredients--list">
        ${recipe.ingredients.map(ingredient => `
          <li class="ingredients--list-item">
            ${ingredient.amount} ${ingredient.unit} ${ingredient.name}
          </li>
        `).join('')}
      </ul>

      ${(recipe.preparation.length > 0) ? `
      <h3 class="preparation--title">Zubereitung</h3>
      <ul class="preparation--list">
        ${recipe.preparation.map(step => `
          <li class="preparation--list-item">${step.description}</li>
        `).join('')}
      </ul>
      ` : ''}
    </section>
    <hr/>
  `
}

let outputTex = fs.readFileSync(templatePath.tex, { encoding: 'utf8' })
  .replace(templateString, recipesTex)
let outputHtml = fs.readFileSync(templatePath.html, { encoding: 'utf8' })
  .replace(templateString, recipesHtml)

fs.writeFileSync(outputPath.tex, outputTex)
fs.writeFileSync(outputPath.html, outputHtml)

// const {exec} = require('child_process')
// exec(`start ${outputPath.html}`)
