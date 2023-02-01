const Recipes = [];
const Materials = [];
const RawMaterials = [];

const newRecipeName = document.getElementById("newRecipeName"),
  newRecipeCount = document.getElementById("newRecipeCount"),
  newRecipeMultiplier = document.getElementById("newRecipeMultiplier"),
  newRecipeClass = document.getElementById("newRecipeClass");

function clearRecipeInput() {
  newRecipeName.value = "";
  newRecipeCount.value = "1";
  newRecipeMultiplier.value = "1";
  newRecipeClass.value = "";
}

const addRecipeButton = document.getElementById("addRecipe");
function addRecipe() {
  const newRecipe = {};
  newRecipe.Name = newRecipeName.value || "";
  newRecipe.Count = Number.parseInt(newRecipeCount.value) || 1;
  newRecipe.Completed = 0;
  newRecipe.Multiplier = Number.parseInt(newRecipeMultiplier.value) || 1;
  newRecipe.CraftCount = Math.ceil(newRecipe.Count/newRecipe.Multiplier);
  newRecipe.Class = newRecipeClass.value;
  newRecipe.Materials = [];

  console.log(newRecipe);
  Recipes.push(newRecipe);

  // Create Recipe List entry from template
  const recipeTemplate = document.getElementById("recipeTemplate");
  const newRecipeTemplate = recipeTemplate.content.firstElementChild.cloneNode(true);

  const templateFields = newRecipeTemplate.querySelectorAll(".recipe-field");
  console.log(templateFields);
  // Count
  templateFields[0].textContent = newRecipe.Count+"x";
  // Name
  templateFields[1].textContent = newRecipe.Name || "<CUSTOM>";
  // Completion
  templateFields[2].textContent = "("+Math.floor(newRecipe.Completed/newRecipe.Multiplier)+"/"+newRecipe.CraftCount+")";
  // Multiplier
  if (newRecipe.Multiplier === 1) {
    templateFields[3].style.display = "none";
  }
  templateFields[3].textContent = "("+newRecipe.Multiplier+"x/Craft)";
  // Class
  templateFields[4].textContent = newRecipe.Class;

  const removeButton = newRecipeTemplate.querySelector(".remove-button");
  removeButton.addEventListener('click', onRemoveRecipe);

  const haveInput = newRecipeTemplate.querySelector(".recipe-have");
  haveInput.addEventListener('change', (event) => { 
    newRecipe.Completed = Number.parseInt(event.target.value) || 0;
    updateRecipe(newRecipe); 
  })

  // Save a reference to our new Element
  newRecipe.Element = newRecipeTemplate;

  document.getElementById("recipeList").appendChild(newRecipeTemplate);

  clearRecipeInput();
  clearMaterialInput();
  clearNewMaterials();
}
addRecipeButton.addEventListener('click', addRecipe);

function removeRecipe(recipe) {
  for (let i=0; i < Recipes.length; i++) {
    const thisRecipe = Recipes[i];
    if (thisRecipe == recipe) {
      Recipes.splice(i, 1);
      if (thisRecipe.Element) {
        thisRecipe.Element.remove();
        thisRecipe.Element = null;
      }
    }
  }
}

function removeRecipeByElement(recipeElement) {
  if (!recipeElement) { return; }
  for (const thisRecipe of Recipes) {
    console.log(thisRecipe);
    if (thisRecipe.Element === recipeElement) {
      removeRecipe(thisRecipe);
      break;
    }
  }
}

function onRemoveRecipe(event) {
  if (!event || !event.target) { return; }
  removeRecipeByElement(event.target.parentNode.parentNode);
}

function updateRecipeElement(recipe) {
  if (!recipe.Element) { return; }
  const recipeFields = recipe.Element.querySelectorAll(".recipe-field");
  // Count
  recipeFields[0].textContent = recipe.Count+"x";
  // Name
  recipeFields[1].textContent = recipe.Name || "<CUSTOM>";
  // Completion
  recipeFields[2].textContent = "("+Math.floor(recipe.Completed/recipe.Multiplier)+"/"+recipe.CraftCount+")";
  // Multiplier
  if (recipe.Multiplier === 1) {
    recipeFields[3].style.display = "none";
  } else if (recipeFields[3].style.display === "none") {
    recipeFields[3].style.display = "block";
  }
  recipeFields[3].textContent = "("+recipe.Multiplier+"x/Craft)";
  // Class
  recipeFields[4].textContent = recipe.Class;

  // Have
  const haveInput = recipe.Element.querySelector(".recipe-have");
  haveInput.value = recipe.Completed;
}

function updateRecipe(recipe) {
  updateRecipeElement(recipe);
}

let newMaterials = [];

const newMaterialName = document.getElementById("newMaterialName"),
  newMaterialCount = document.getElementById("newMaterialCount"),
  newMaterialMultiplier = document.getElementById("newMaterialMultiplier"),
  newMaterialClass = document.getElementById("newMaterialClass"),
  newMaterialLocation = document.getElementById("newMaterialLocation"),
  newMaterialTime = document.getElementById("newMaterialTime");

function clearMaterialInput() {
  newMaterialName.value = "";
  newMaterialCount.value = "1";
  newMaterialMultiplier.value = "1";
  newMaterialClass.value = "";
  newMaterialLocation.value = "";
  newMaterialTime.value = "";
}

const addMaterialButton = document.getElementById("addMaterial");
/** Adds new material to the new recipe being worked on, based on values entered. */
function addNewMaterial() {
  const newMaterial = {};
  newMaterial.Name = newMaterialName.value || "";
  if (newMaterial.Name === "") { return; } // Can't have nameless Materials.
  newMaterial.Count = Number.parseInt(newMaterialCount.value) || 1;
  newMaterial.Multiplier = Number.parseInt(newMaterialMultiplier.value) || 1;
  newMaterial.CraftCount = Math.ceil(newMaterial.Count/newMaterial.Multiplier);
  newMaterial.Class = newMaterialClass.value;
  newMaterial.Materials = [];
  newMaterial.Location = newMaterialLocation.value;
  newMaterial.Time = newMaterialTime.value;

  for (const material of Materials) {
    // On match, assume we just want more of the same Material without updating.
    // This allows us to add more of a Material simply by entering its Name and Count.
    // Kind of like a ghetto autofill, really.
    if (newMaterial.Name === material.Name) {
      newMaterial.Multiplier = material.Multiplier;
      newMaterial.CraftCount = Math.ceil(newMaterial.Count/newMaterial.Multiplier);
      newMaterial.Class = material.Class;
      newMaterial.Location = material.Location;
      newMaterial.Time = material.Time;
    }
    console.log("Preexisting Material entered!");
    console.log(newMaterial);
  }

  for (const material of newMaterials) {
    // Update on matches. Assume they meant to make a correction to the New Material.
    if (newMaterial.Name === material.Name) {
      material.Count = newMaterial.Count;
      material.Multiplier = newMaterial.Multiplier;
      material.CraftCount = newMaterial.CraftCount;
      material.Class = newMaterial.Class;
      material.Location = newMaterial.Location;
      material.Time = newMaterial.Time;

      console.log(newMaterial);
      updateNewMaterialElement(material);
      clearMaterialInput();
      return;
    }
  }

  newMaterials.push(newMaterial);
  console.log(newMaterial);

  // Create New Material List entry from template
  const materialTemplate = document.getElementById("newMaterialTemplate");
  const newMaterialTemplate = materialTemplate.content.firstElementChild.cloneNode(true);

  const templateFields = newMaterialTemplate.querySelectorAll(".material-field");
  // Count
  templateFields[0].textContent = newMaterial.Count+"x";
  // Name
  templateFields[1].textContent = newMaterial.Name;
  // Multiplier
  templateFields[2].textContent = "("+newMaterial.Multiplier+"x/Craft)";
  if (newMaterial.Multiplier === 1) {
    templateFields[2].style.display = "none";
  }
  // Class
  templateFields[3].textContent = newMaterial.Class;
  // Location
  templateFields[4].textContent = newMaterial.Location;
  // Time
  templateFields[5].textContent = newMaterial.Time;

  // Save a reference to our new Element
  newMaterial.Element = newMaterialTemplate;

  document.getElementById("newMaterialList").append(newMaterialTemplate);

  clearMaterialInput();
}
addMaterialButton.addEventListener('click', addNewMaterial);

function clearNewMaterials() {
  for (const newMaterial of newMaterials) {
    if (newMaterial.Element) {
      newMaterial.Element.remove();
      newMaterial.Element = null;
    }
  }
  newMaterials = [];
}

function updateNewMaterialElement(newMaterial) {
  if (!newMaterial.Element) { return; }
  const newMaterialFields = newMaterial.Element.querySelectorAll(".material-field");
  // Count
  newMaterialFields[0].textContent = newMaterial.Count+"x";
  // Name
  newMaterialFields[1].textContent = newMaterial.Name || "<CUSTOM>";
  // Multiplier
  newMaterialFields[2].style.display = newMaterial.Multiplier === 1 ? "none" : "block";
  newMaterialFields[2].textContent = "("+newMaterial.Multiplier+"x/Craft)";
  // Class
  newMaterialFields[3].textContent = newMaterial.Class;
  // Location
  newMaterialFields[4].textContent = newMaterial.Location;
  // Time
  newMaterialFields[5].textContent = newMaterial.Time;
}
