const Recipes = [];
const Materials = [];

function getMaterialByName(name) {
  for (const material of Materials) {
    if (material.name === name) {
      return material;
    }
  }
  return null;
}

class Recipe {
  #name = "";
  #count = 1;
  #completed = 0;
  #craftClass = "";
  #craftCount = 1;
  #craftCountTotal = 1;
  #materials = [];
  #multiplier = 1;
  #element = null;

  constructor(name = "", count = 1, multiplier = 1, craftClass = "") {
    this.#name = name.toString();
    this.#count = (count >= 0) ? count : 1;
    this.#multiplier = (multiplier > 0) ? multiplier : 1;
    this.#craftClass = craftClass.toString();

    this.#craftCount = this.calculateCraftCount();
    this.#craftCountTotal = this.calculateCraftCountTotal();
  }

  destroy() {
    if (this.#element) {
      this.#element.remove();
      this.#element = null;
    }
    this.#count = 0;
    this.#completed = 0;
    this.updateCraftCount();
  }

  get name() {
    return this.#name;
  }
  set name(newName) {
    this.#name = newName || "";
    this.updateElement();
  }

  get count() {
    return this.#count;
  }
  set count(value) {
    this.#count = (value && value > 0) ? value : 1;
    this.updateCraftCount();
  }
  
  get completed() {
    return this.#completed;
  }
  set completed(value) {
    this.#completed = (value && value >= 0) ? value : 0;
    this.updateCraftCount();
  }

  get craftClass() {
    return this.#craftClass;
  }
  set craftClass(value) {
    this.#craftClass = value || "";
  }

  get craftCount() {
    return this.#craftCount;
  }

  get craftCountTotal() {
    return this.#craftCountTotal
  }

  get element() {
    return this.#element;
  }
  set element(newElement) {
    if (this.#element && this.#element != newElement) {
      this.#element.remove();
    }
    this.#element = newElement;
    this.updateElement();
  }

  get materials() {
    return this.#materials;
  }

  get multiplier() {
    return this.#multiplier;
  }
  set multiplier(value) {
    this.#multiplier = (value && value > 0) ? value : 1;
    this.updateCraftCount();
  }

  calculateCraftCount() {
    return Math.max(Math.ceil((this.#count - this.#completed)/this.#multiplier), 0);
  }

  calculateCraftCountTotal() {
    return Math.ceil(this.#count/this.#multiplier);
  }

  updateCraftCount() {
    console.log("Updating");
    const lastCraftCount = this.#craftCount,
      lastCraftCountTotal = this.#craftCountTotal;
    
    const newCraftCount = this.calculateCraftCount();
    const newCraftCountTotal = this.calculateCraftCountTotal();

    const difference = newCraftCount - lastCraftCount;

    if (difference === 0) {
      if (newCraftCountTotal === lastCraftCountTotal) {
        this.updateElement();
        return;
      }
      this.#craftCountTotal = newCraftCountTotal;
      this.updateElement();
      return;
    }

    for (const materialArray of this.#materials) {
      const adjustBy = materialArray[1] * difference;
      materialArray[0].recipeAdjustCount(adjustBy);
    }

    this.#craftCount = newCraftCount;
    this.#craftCountTotal = newCraftCountTotal;
    
    this.updateElement();
  }

  createElement() {
    if (this.#element) {
      this.#element.remove();
      this.#element = null;
    }

    // Create Recipe List entry from template
    const recipeTemplate = document.getElementById("recipeTemplate");
    const newRecipeTemplate = recipeTemplate.content.firstElementChild.cloneNode(true);

    this.element = newRecipeTemplate;

    const removeButton = newRecipeTemplate.querySelector(".remove-button");
    removeButton.addEventListener('click', onRemoveRecipe);

    const haveInput = newRecipeTemplate.querySelector(".recipe-have");
    haveInput.addEventListener('change', (event) => { 
      this.completed = Number.parseInt(event.target.value) || 0;
    });
  }

  updateElement() {
    if (!this.#element) {
      return;
    }
    const fields = this.#element.querySelectorAll(".recipe-field");
    // Count
    fields[0].textContent = this.#count+"x";
    // Name
    fields[1].textContent = this.#name || "<CUSTOM>";
    // Completion
    fields[2].textContent = "("+Math.floor(this.#completed/this.#multiplier)+"/"+this.#craftCountTotal+")";
    // Multiplier
    fields[3].style.display = (this.#multiplier === 1) ? "none" : "block";
    fields[3].textContent = "("+this.#multiplier+"x/Craft)";
    // Class
    fields[4].textContent = this.#craftClass;

    // Have
    const haveInput = this.#element.querySelector(".recipe-have");
    haveInput.value = this.#completed;
  }

  addMaterial(newMaterial, amountPerCraft = 1) {
    if (!newMaterial || amountPerCraft < 1) { return; }
    for (const material of this.#materials) {
      if (material[0] === newMaterial) {
        console.warn("Recipe: Attempted to add duplicate Material to list!");
        return;
      }
    }
    
    const newMaterialArray = [
      newMaterial,
      amountPerCraft
    ];
    this.#materials.push(newMaterialArray);

    newMaterial.recipeAdjustCount(this.#craftCount * amountPerCraft);
  }
}

class Material {
  #name = "";
  #count = 0;
  #completed = 0;
  #craftClass = "";
  #craftCount = 0;
  #craftCountTotal = 0;
  #location = "";
  #materials = [];
  #multiplier = 1;
  #time = "";
  #timeAMPM = false;
  #element = null;

  constructor(name, multiplier = 1, craftClass = "", location = "", time = "", timeAMPM = false) {
    if (!name || name === "") {
      error("Material: Attempted to create Material with invalid or blank name!");
    }
    this.#name = name.toString();
    this.#multiplier = (multiplier > 0) ? multiplier : 1;
    this.#craftClass = craftClass.toString();
    this.#location = location.toString();
    this.#time = time.toString();
    this.#timeAMPM = (timeAMPM == true);
  }

  get name() {
    return this.#name;
  }
  set name(newName) {
    if (!newName || newName === "") {
      error("Material: Attempted to set invalid or blank name!");
    } 
    this.#name = newName.toString();
    this.updateElement();
  }

  get count() {
    return this.#count;
  }
  
  get completed() {
    return this.#completed;
  }

  get class() {
    return this.#craftClass;
  }

  get craftCount() {
    return this.#craftCount;
  }
  
  get location() {
    return this.#location;
  }

  get materials() {
    return this.#materials;
  }

  get multiplier() {
    return this.#multiplier;
  }

  get time() {
    return this.#time;
  }

  get timeAMPM() {
    return this.#timeAMPM;
  }

  calculateCraftCount() {
    return Math.max(Math.ceil((this.#count - this.#completed)/this.#multiplier), 0);
  }

  calculateCraftCountTotal() {
    return Math.ceil(this.#count/this.#multiplier);
  }

  updateCraftCount() {
    console.log("Updating");
    const lastCraftCount = this.#craftCount,
      lastCraftCountTotal = this.#craftCountTotal;
    
    const newCraftCount = this.calculateCraftCount();
    const newCraftCountTotal = this.calculateCraftCountTotal();

    const difference = newCraftCount - lastCraftCount;

    if (difference === 0) {
      if (newCraftCountTotal === lastCraftCountTotal) {
        this.updateElement();
        return;
      }
      this.#craftCountTotal = newCraftCountTotal;
      this.updateElement();
      return;
    }

    for (const materialArray of this.#materials) {
      const adjustBy = materialArray[1] * difference;
      materialArray[0].recipeAdjustCount(adjustBy);
    }

    this.#craftCount = newCraftCount;
    this.#craftCountTotal = newCraftCountTotal;
    
    this.updateElement();
  }

  updateElement() {
    if (!this.#element) {
      return;
    }
  }

  addMaterial(newMaterial, amountPerCraft = 1) {
    if (!newMaterial || amountPerCraft < 1) { return; }
    for (const material of this.#materials) {
      if (material[0] === newMaterial) {
        console.warn("Material: Attempted to add duplicate Material to list!");
        return;
      }
    }
    
    const newMaterialArray = [
      newMaterial,
      amountPerCraft
    ];
    this.#materials.push(newMaterialArray);

    newMaterial.recipeAdjustCount(this.#craftCount * amountPerCraft);
  }

  recipeAdjustCount(amount) {
    this.#count = Math.max(0, this.#count + amount);
    this.updateCraftCount();
  }
}


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
  const newRecipe = new Recipe(newRecipeName.value, (Number.parseInt(newRecipeCount.value) || 1), Number.parseInt(newRecipeMultiplier.value), newRecipeClass.value);
  
  Recipes.push(newRecipe);

  for (const newMaterial of newMaterials) {
    const material = createMaterialFromNewMaterial(newMaterial);
    newRecipe.addMaterial(material, newMaterial.Count);
  }

  newRecipe.createElement();

  console.log(newRecipe);

  document.getElementById("recipeList").appendChild(newRecipe.element);

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
      recipe.destroy();
      break;
    }
  }
}

function removeRecipeByElement(recipeElement) {
  if (!recipeElement) { return; }
  for (const thisRecipe of Recipes) {
    console.log(thisRecipe);
    if (thisRecipe.element === recipeElement) {
      removeRecipe(thisRecipe);
      break;
    }
  }
}

function onRemoveRecipe(event) {
  if (!event || !event.target) { return; }
  removeRecipeByElement(event.target.parentNode.parentNode);
}

function createMaterialFromNewMaterial(newMaterial) {
  for (const material of Materials) {
    if (newMaterial.Name === material.name) {
      console.log("Preexisting Material entered!:", material);
      return material;
    }
  }

  // Create a new Material
  const material = new Material(newMaterial.Name, newMaterial.Multiplier, newMaterial.Class, newMaterial.Location, newMaterial.Time);
  //material.createElement();
  Materials.push(material);

  console.log(material);

  return material;
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
  newMaterial.Class = newMaterialClass.value;
  newMaterial.Materials = [];
  newMaterial.Location = newMaterialLocation.value;
  newMaterial.Time = newMaterialTime.value;

  for (const material of Materials) {
    // On match, assume we just want more of the same Material without updating.
    // This allows us to add more of a Material simply by entering its Name and Count.
    // Kind of like a ghetto autofill, really.
    if (newMaterial.Name === material.name) {
      newMaterial.Multiplier = material.multiplier;
      newMaterial.Class = material.craftClass;
      newMaterial.Location = material.location;
      newMaterial.Time = material.time;
      console.log("Preexisting Material entered!");
      console.log(newMaterial);
    }
  }

  for (const material of newMaterials) {
    // Update on matches. Assume they meant to make a correction to the New Material.
    if (newMaterial.Name === material.Name) {
      material.Count = newMaterial.Count;
      material.Multiplier = newMaterial.Multiplier;
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

const addRecipePanel = document.getElementById("addRecipePanel");
document.getElementById("closePanel").addEventListener('click', (event) => {
  addRecipePanel.style.display = "none";
});
document.getElementById("addRecipe2").addEventListener('click', (event) => {
  addRecipePanel.style.display = "block";
})
