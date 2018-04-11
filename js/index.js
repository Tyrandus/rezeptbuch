let app = new Vue({
  el: '#app',
  data: {
    editMode: true,
    recipes: [
      {
        title: 'Rezepttitel',
        portions: 1,
        category: 'Kategorie',
        description: 'Eine Beschreibung',
        vegetarian: true,
        ingredients: [],
        preparation: []
      }
    ],
    activeRecipe: null,
    activeCategory: null
  },
  computed: {

    // Check whether a recipe is currently selected
    isRecipeSelected: function () {
      return this.activeRecipe != null
    },

    // Filter recipe by active category and return the results sorted
    filteredRecipes: function () {
      if (!this.recipes) return []
      return this.recipes
        .filter(r => {
          return this.activeCategory === null ||
          r.category === this.activeCategory
        })
        .sort((a, b) => {
          if (!a.title || !b.title) { return 1 }
          return a.title.toUpperCase().charCodeAt(0) > b.title.toUpperCase().charCodeAt(0)
        })
    },

    // Retrieve the categories iterating over all recipes
    categories: function () {
      let categoryList = []
      if (this.recipes) {
        this.recipes.forEach((recipe) => {
          if (categoryList.indexOf(recipe.category) === -1) {
            categoryList.push(recipe.category)
          }
        }, [])
      }
      return categoryList.sort()
    }
  },
  methods: {

    // Read selected file to get its content
    onFileInputChanged: function (evt) {
      let selectedFile = evt.target.files[0]
      let reader = new FileReader()
      reader.onload = function () {
        app.handleInputFile(reader.result)
      }
      reader.readAsText(selectedFile)
    },

    // Process content of an "uploaded" file and add it to the app state
    handleInputFile: function (textContent) {
      try {
        let jsonContent = JSON.parse(textContent)
        this.recipes = jsonContent.content.recipes
        this.activeCategory = null
        this.activeRecipe = null
      } catch (exception) {
        alert('Fehler beim Öffnen der Datei!')
      }
    },

    // Offer a file containing all currently active recipes to download
    downloadRecipes: function () {
      let activeRecord = { content: { recipes: this.recipes } }
      let fileContent = JSON.stringify(activeRecord)

      let hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/plain;charset=utf-8,' + encodeURI(fileContent)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'rezeptbuch.json'
      hiddenElement.style.display = 'none'
      document.body.append(hiddenElement)
      hiddenElement.click()
    },

    // Check whether a given category is currently active
    isActiveCategory: function (category) {
      return category === this.activeCategory
    },

    // Toggle the currently active category
    toggleActiveCategory: function (category) {
      if (this.activeCategory === category) {
        this.activeCategory = null
      } else {
        this.activeCategory = category
        if (this.activeRecipe && this.activeRecipe.category !== this.activeCategory) {
          this.toggleActiveRecipe(this.activeRecipe)
        }
      }
    },

    // Check whether a given recipe is currently active
    isActiveRecipe: function (recipe) {
      return recipe === this.activeRecipe
    },

    // Toggle the currently active recipe
    toggleActiveRecipe: function (recipe) {
      this.activeRecipe = (this.activeRecipe === recipe) ? null : recipe
    },

    // Add a new ingredient to the active recipe
    addIngredient: function () {
      this.activeRecipe.ingredients.push({
        amount: '',
        unit: '',
        name: ''
      })
    },

    // Remove the ingredient of given index from the active recipe
    removeIngredient: function (index) {
      this.activeRecipe.ingredients.splice(index, 1)
    },

    // Add a new preparation step to the active recipe
    addStep: function () {
      this.activeRecipe.preparation.push({description: ''})
    },

    // Remove the preparation step of given index from the active recipe
    removeStep: function (index) {
      this.activeRecipe.preparation.splice(index, 1)
    },

    // Add a recipe to the active record
    addRecipe: function () {
      let recipe = {
        title: '',
        portions: 0,
        category: '',
        description: '',
        vegetarian: true,
        ingredients: [],
        preparation: []
      }
      this.recipes.push(recipe)
      this.activeRecipe = recipe
    },

    // Delete the recipe of given index
    deleteRecipe: function (index) {
      if (confirm(`Soll das Rezept "${this.recipes[index].title}" wirklich gelöscht werden?`)) {
        if (this.activeRecipe === this.recipes[index]) {
          this.activeRecipe = null
        }
        this.recipes.splice(index, 1)
      }
    },

    // Move the active recipe's preparation step of given index in the given direction
    moveStep: function (index, direction) {
      let preparationSteps = this.activeRecipe.preparation

      if ((index === preparationSteps.length && direction > 0) ||
          (index === 0 && direction < 0)) return

      let temp = preparationSteps[index]
      this.removeStep(index)
      preparationSteps.splice(index + direction, 0, temp)
    },

    // Move the active recipe's ingredient of given index in the given direction
    moveIngredient: function (index, direction) {
      let ingredients = this.activeRecipe.ingredients

      if ((index === ingredients.length && direction > 0) ||
          (index === 0 && direction < 0)) return

      let temp = ingredients[index]
      this.removeIngredient(index)
      ingredients.splice(index + direction, 0, temp)
    }
  },
  mounted: function () {
    this.activeRecipe = {
      title: '',
      portions: 0,
      category: '',
      description: '',
      vegetarian: true,
      ingredients: [],
      preparation: []
    }
  }
})
