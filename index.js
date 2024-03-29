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

    const materialList = newRecipeTemplate.querySelector(".recipe-materials");
    for (const material of this.#materials) {
      const li = document.createElement("li");
      li.textContent = material[1]+"x "+material[0].name;
      materialList.appendChild(li);
    }

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

    // Update color if completed (completed >= count)
    if (this.#completed >= this.#count) {
      if (!this.#element.classList.contains("recipe-item--completed")) {
        this.#element.classList.add("recipe-item--completed");
      }
    } else {
      if (this.#element.classList.contains("recipe-item--completed")) {
        this.#element.classList.remove("recipe-item--completed");
      }
      if (this.#materials.length > 0) {
        // Check if we have enough to craft at least once
        let enoughToCraft = true;
        for (const material of this.#materials) {
          if (material[0].completed < material[1]) {
            enoughToCraft = false;
          }
        }
        if (enoughToCraft && !this.#element.classList.contains("recipe-item--available")) {
          this.#element.classList.add("recipe-item--available");
        } else if (!enoughToCraft && this.#element.classList.contains("recipe-item--available")) {
          this.#element.classList.remove("recipe-item--available");
        }
      }
    }
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
  #timeStart = "";
  #timeEnd = "";
  #timeStart2 = "";
  #timeEnd2 = "";
  #timeAMPM = false;
  #element = null;
  #timeElement = null;

  constructor(name, multiplier = 1, craftClass = "", location = "", timeStart = "", timeEnd = "", timeAMPM = false) {
    if (!name || name === "") {
      error("Material: Attempted to create Material with invalid or blank name!");
    }
    this.#name = name.toString();
    this.#multiplier = (multiplier > 0) ? multiplier : 1;
    this.#craftClass = craftClass.toString();
    this.#location = location.toString();
    this.#timeAMPM = (timeAMPM == true);
    this.timeStart = timeStart.toString();
    this.timeEnd = timeEnd.toString();
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
    this.updateTimeElement();
  }

  get count() {
    return this.#count;
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

  get craftCount() {
    return this.#craftCount;
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

  get timeElement() {
    return this.#timeElement;
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

  get timeStart() {
    return this.#timeStart;
  }
  set timeStart(value = "") {
    this.#timeStart = value;
    if (this.#timeAMPM) {
      this.#timeStart2 = this.#getFlippedTime(value);
    } else {
      this.#timeStart2 = "";
    }
  }

  get timeEnd() {
    return this.#timeEnd;
  }
  set timeEnd(value = "") {
    this.#timeEnd = value;
    if (this.#timeAMPM) {
      this.#timeEnd2 = this.#getFlippedTime(value);
    } else {
      this.#timeEnd2 = "";
    }
  }

  get timeAMPM() {
    return this.#timeAMPM;
  }
  set timeAMPM(value = false) {
    this.#timeStart2 = (value) ? this.#getFlippedTime(this.#timeStart) : "";
    this.#timeEnd2 = (value) ? this.#getFlippedTime(this.#timeEnd) : "";
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

    // Create Material List entry from template
    const materialTemplate = document.getElementById("materialTemplate");
    const newMaterialTemplate = materialTemplate.content.firstElementChild.cloneNode(true);

    this.element = newMaterialTemplate;

    const haveInput = newMaterialTemplate.querySelector(".material-have");
    haveInput.addEventListener('change', (event) => { 
      this.completed = Number.parseInt(event.target.value) || 0;
    });
  }

  updateElement() {
    if (!this.#element) {
      return;
    }
    const fields = this.#element.querySelectorAll(".material-field");
    // Count
    fields[0].textContent = this.#count+"x";
    // Name
    fields[1].textContent = this.#name;
    // Multiplier
    fields[2].style.display = (this.#multiplier === 1) ? "none" : "block";
    fields[2].textContent = "("+this.#multiplier+"x/Craft)";
    // Class
    fields[3].textContent = this.#craftClass;
    // Location
    fields[4].textContent = this.#location;
    // Time
    fields[5].textContent = this.#timeStart + (this.#timeEnd != "" ? " - " + this.#timeEnd : "");
    if (this.#timeStart != "" && this.#timeEnd != "" && this.#timeAMPM) {
      fields[5].textContent += " | " + this.#timeStart2 + " - " + this.#timeEnd2;
    }
    // Completion
    fields[6].textContent = "("+Math.floor(this.#completed/this.#multiplier)+"/"+this.#craftCountTotal+")";

    // Have
    const haveInput = this.#element.querySelector(".material-have");
    haveInput.value = this.#completed;

    // Update color if completed (completed >= count)
    if (this.#completed >= this.#count) {
      if (!this.#element.classList.contains("material-item--completed")) {
        this.#element.classList.add("material-item--completed");
        if (this.#timeElement) {
          this.#timeElement.classList.add("material-item--completed");
        }
      }
    } else {
      if (this.#element.classList.contains("material-item--completed")) {
        this.#element.classList.remove("material-item--completed");
        if (this.#timeElement) {
          this.#timeElement.classList.remove("material-item--completed");
        }
      }
      if (this.#materials.length > 0) {
        // Check if we have enough to craft at least once
        let enoughToCraft = true;
        for (const material of this.#materials) {
          if (material[0].completed < material[1]) {
            enoughToCraft = false;
          }
        }
        if (enoughToCraft && !this.#element.classList.contains("material-item--available")) {
          this.#element.classList.add("material-item--available");
        } else if (!enoughToCraft && this.#element.classList.contains("material-item--available")) {
          this.#element.classList.remove("material-item--available");
        }
      }
    }

    // Hide material if count is 0 and have 0
    if (this.#completed === 0 && this.#count === 0) {
      if (!this.#element.classList.contains("hidden")) {
        this.#element.classList.add("hidden");
        if (this.#timeElement) {
          this.#timeElement.classList.add("hidden");
        }
      }
    } else {
      if (this.#element.classList.contains("hidden")) {
        this.#element.classList.remove("hidden");
        if (this.#timeElement) {
          this.#timeElement.classList.remove("hidden");
        }
      }
    }

    // Update any Recipe that relies on us
    for (const recipe of Recipes) {
      for (const material of recipe.materials) {
        if (material[0] == this) {
          recipe.updateElement();
          break;
        }
      }
    }

    // Update any Material that relies on us
    for (const material of Materials) {
      if (material === this) { continue; }
      for (const submaterial of material.materials) {
        if (submaterial[0] == this) {
          material.updateElement();
          break;
        }
      }
    }
  }

  createTimeElement() {
    if (this.#timeElement) {
      this.#timeElement.remove();
      this.#timeElement = null;
    }

    // Don't create a timeElement if it isn't time-gated.
    if (!this.#timeElement && (!this.#timeStart || this.#timeStart === "")) {
      return;
    }

    // Create Timed Material List entry from template
    const timedMaterialTemplate = document.getElementById("timedMaterialTemplate");
    const newTimedMaterialTemplate = timedMaterialTemplate.content.firstElementChild.cloneNode(true);

    this.#timeElement = newTimedMaterialTemplate;
    this.updateTimeElement();
  }

  updateTimeElement() {
    if (!this.#timeElement) {
      return;
    }
    const fields = this.#timeElement.querySelectorAll(".material-field");
    // Name
    fields[0].textContent = this.#name;
    // Class
    fields[1].textContent = this.#craftClass;
    // Location
    fields[2].textContent = this.#location;
    // Time
    fields[3].textContent = this.#timeStart + (this.#timeEnd != "" ? "-" + this.#timeEnd : "");
    // FlippedTime
    if (this.#timeAMPM) {
      fields[4].textContent = this.#timeStart2 + (this.#timeEnd2 != "" ? "-" + this.#timeEnd2 : "");
    } else {
      console.log("False");
    }
  }

  #getFlippedTime(time) {
    if (!time || time === "") { return ""; }
    const regex = /(\d\d):(\d\d)/;
    const newTime = regex.exec(time);
    
    if (!newTime || !newTime[1] || !newTime[2]) { return ""; }

    const flippedHour = (Number(newTime[1]) + 12 % 24);
    return (flippedHour.toString().padStart(2,"0") + ":" + newTime[2]);
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

let Collator = new Intl.Collator();

function addElementToSortedList(element, listEle) {
  if (!element || !listEle) { return; }
  
  const sortType = listEle.getAttribute("data-sortType");
  if (!sortType || sortType === "") {
    listEle.appendChild(element); // Unsorted list
    return;
  }

  if (sortType === "alphabetical") {
    switch(listEle.id) {
      case "timerList":
      case "materialList":
      case "rawMaterialList":
        for (const other of listEle.children) {
          const compare = Collator.compare(element.querySelector(".material-name").textContent, other.querySelector(".material-name").textContent);
          if (compare < 0) {
            listEle.insertBefore(element, other);
            return;
          }
        }
        listEle.appendChild(element);
        break;
      default:
        listEle.appendChild(element);
    }
  }

  listEle.appendChild(element);
}

const newRecipeName = document.getElementById("newRecipeName"),
  newRecipeCount = document.getElementById("newRecipeCount"),
  newRecipeMultiplier = document.getElementById("newRecipeMultiplier"),
  newRecipeClass = document.getElementById("newRecipeClass");

function clearRecipeInput() {
  newRecipeName.value = "";
  newRecipeCount.value = "1";
  newRecipeMultiplier.value = "1";
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
  const material = new Material(newMaterial.Name, newMaterial.Multiplier, newMaterial.Class, newMaterial.Location, newMaterial.TimeStart, newMaterial.TimeEnd, newMaterial.TimeAMPM);
  material.createElement();
  material.createTimeElement();

  Materials.push(material);

  for (const subMaterialArray of newMaterial.Materials) {
    const subMaterial = createMaterialFromNewMaterial(subMaterialArray[0]);
    material.addMaterial(subMaterial, subMaterialArray[1]);
  }

  console.log(material);

  if (material.materials.length > 0) {
    addElementToSortedList(material.element, document.getElementById("materialList"));
  } else {
    addElementToSortedList(material.element, document.getElementById("rawMaterialList"));
  }

  if (material.timeElement) {
    addElementToSortedList(material.timeElement, document.getElementById("timerList"));
  }

  return material;
}

let newMaterials = [];
let uniqueNewMaterials = [];

const newMaterialName = document.getElementById("newMaterialName"),
  newMaterialCount = document.getElementById("newMaterialCount"),
  newMaterialMultiplier = document.getElementById("newMaterialMultiplier"),
  newMaterialClass = document.getElementById("newMaterialClass"),
  newMaterialLocation = document.getElementById("newMaterialLocation"),
  newMaterialTime = document.getElementById("newMaterialTime"),
  newMaterialTimeEnd = document.getElementById("newMaterialTimeEnd"),
  newMaterialTimeAMPM = document.getElementById("newMaterialTimeAMPM");

function clearMaterialInput() {
  newMaterialName.value = "";
  newMaterialCount.value = "1";
  newMaterialMultiplier.value = "1";
  newMaterialClass.value = "";
  newMaterialLocation.value = "";
  newMaterialTime.value = "";
  newMaterialTimeEnd.value = "";
  newMaterialTimeAMPM.checked = false;
}

function createNewMaterial(name) {
  const newMaterial = {};
  newMaterial.Name = name || "";
  if (newMaterial.Name === "") { return null; } // Can't have nameless Materials.
  newMaterial.Count = 1;
  newMaterial.Multiplier = 1;
  newMaterial.Class = "";
  newMaterial.Materials = [];
  newMaterial.Location = "";
  newMaterial.TimeStart = "";
  newMaterial.TimeEnd = "";
  newMaterial.TimeAMPM = false;

  return newMaterial;
}

function clearSubMaterialInput(fieldList) {
  if (!fieldList) { return; }
  fieldList[0].value = "";
  fieldList[1].value = "1";
  fieldList[2].value = "1";
  fieldList[3].value = "";
  fieldList[4].value = "";
  fieldList[5].value = "";
  fieldList[6].value = "";
  fieldList[7].checked = false;
}

function addNewSubMaterial(event, parentMaterial) {
  if (!event || !parentMaterial) { return; }
  const controlFields = event.target.parentNode.querySelectorAll(".submaterial-control");
  if (!controlFields) { return; }

  // Try to get a newMaterial using our Name input.
  const name = controlFields[0].value;
  if (parentMaterial.Name === name) {
    return; // Can't make a material a submaterial of itself.
  }
  const newMaterial = createNewMaterial(name);
  if (!newMaterial) { return; }

  // Count
  newMaterial.Count = Number.parseInt(controlFields[1].value) || 1;
  // Multiplier
  newMaterial.Multiplier = Number.parseInt(controlFields[2].value) || 1;
  // Class
  newMaterial.Class = controlFields[3].value;
  // Location
  newMaterial.Location = controlFields[4].value;
  // TimeStart
  newMaterial.TimeStart = controlFields[5].value;
  // TimeEnd
  newMaterial.TimeEnd = controlFields[6].value;
  // TimeAMPM
  newMaterial.TimeAMPM = controlFields[7].checked;

  // Try to add it to our parentMaterial
  addNewMaterial(newMaterial, parentMaterial);

  clearSubMaterialInput(controlFields);
}

const addMaterialButton = document.getElementById("addMaterial");
/** Adds new material to the new recipe being worked on, based on values entered. */
function addNewMaterial(newMaterial, parentMaterial) {
  if (!newMaterial) {
    newMaterial = createNewMaterial(newMaterialName.value);
    if (!newMaterial) { return; }
    newMaterial.Count = Number.parseInt(newMaterialCount.value) || 1;
    newMaterial.Multiplier = Number.parseInt(newMaterialMultiplier.value) || 1;
    newMaterial.Class = newMaterialClass.value;
    newMaterial.Location = newMaterialLocation.value;
    newMaterial.TimeStart = newMaterialTime.value; 
    newMaterial.TimeEnd = newMaterialTimeEnd.value;
    newMaterial.TimeAMPM = newMaterialTimeAMPM.checked;
  }

  let existingMaterial = false;
  let existingRealMaterial = false;
  for (const material of Materials) {
    // On match, assume we just want more of the same Material without updating.
    // This allows us to add more of a Material simply by entering its Name and Count.
    // Kind of like a ghetto autofill, really.
    if (newMaterial.Name === material.name) {
      newMaterial.Multiplier = material.multiplier;
      newMaterial.Class = material.craftClass;
      newMaterial.Location = material.location;
      newMaterial.TimeStart = material.timeStart;
      newMaterial.TimeEnd = material.timeEnd;
      newMaterial.TimeAMPM = material.timeAMPM;
      console.log("Preexisting Material entered!");
      console.log(newMaterial);

      existingMaterial = true;
      existingRealMaterial = true;
    }
  }

  for (const material of newMaterials) {
    // Update on matches. Assume they meant to make a correction to the New Material.
    if (newMaterial.Name === material.Name && !parentMaterial) {
      if (existingRealMaterial) { // Unless it's actually a real Material, in which case we can only safely change the Count.
        material.Count = newMaterial.Count;
        console.log(newMaterial);
        updateNewMaterialElement(material);
        clearMaterialInput();
        return;
      }
      material.Count = newMaterial.Count;
      material.Multiplier = newMaterial.Multiplier;
      material.Class = newMaterial.Class;
      material.Location = newMaterial.Location;
      material.TimeStart = newMaterial.TimeStart;
      material.TimeEnd = newMaterial.TimeEnd;
      material.TimeAMPM = newMaterial.TimeAMPM;

      console.log(newMaterial);
      updateNewMaterialElement(material);
      clearMaterialInput();
      return;
    }
  }

  if (parentMaterial) {
    for (const material of parentMaterial.Materials) {
      // Update on matches. Assume they meant to make a correction to the New Sub-Material.
      if (newMaterial.Name === material[0].Name) {
        if (existingRealMaterial) { // Unless it's actually a real Material, in which case we can only safely change the Count.
          material[0].Count = newMaterial.Count;
          console.log(newMaterial);
          updateNewMaterialElement(material[0]);
          clearMaterialInput();
          return;
        }
        material[0].Count = newMaterial.Count;
        material[0].Multiplier = newMaterial.Multiplier;
        material[0].Class = newMaterial.Class;
        material[0].Location = newMaterial.Location;
        material[0].TimeStart = newMaterial.TimeStart;
        material[0].TimeEnd = newMaterial.TimeEnd;
        material[0].TimeAMPM = newMaterial.TimeAMPM;

        console.log(newMaterial);
        updateNewMaterialElement(material[0]);
        clearMaterialInput();
        return;
      }
    }
  }

  if (!existingMaterial) {
    for (const material of uniqueNewMaterials) {
      if (newMaterial.Name === material.Name) {
        // Copy from unique material on match. This is in case we've defined the material, but in a sub-material.
        newMaterial.Multiplier = material.Multiplier;
        newMaterial.Class = material.Class;
        newMaterial.Location = material.Location;
        newMaterial.TimeStart = material.TimeStart;
        newMaterial.TimeEnd = material.TimeEnd;
        newMaterial.TimeAMPM = material.TimeAMPM;
        console.log("Preexisting Material entered!");
        console.log(newMaterial);

        existingMaterial = true;
      }
    }
  }

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
  templateFields[5].textContent = newMaterial.TimeStart;
  templateFields[5].textContent += (newMaterial.TimeEnd != "") ? " - " + newMaterial.TimeEnd : "";
  // TimeAMPM
  templateFields[6].textContent = (newMaterial.TimeAMPM) ? "AM/PM" : "";

  // Save a reference to our new Element
  newMaterial.Element = newMaterialTemplate;

  // Rig up Add Material button to reveal Submaterial Controls
  const addButton = newMaterialTemplate.querySelector(".add-button");
  if (existingMaterial) {
    addButton.classList.add("hidden"); // We shouldn't modify duplicates of Materials until a proper Edit solution is in place.
  } else {
    addButton.addEventListener('click', (event) => {
      if (!event.target) { return; }
      const submaterialControls = event.target.parentNode.parentNode.parentNode.querySelector(".submaterial-controls");
      if (submaterialControls) {
        if (!submaterialControls.classList.contains("hidden")) {
          submaterialControls.classList.add("hidden");
        } else {
          submaterialControls.classList.remove("hidden");
        }
      }
    });
  }

  // Rig up Submaterial Controls' close button
  const submaterialCloseButton = newMaterialTemplate.querySelector(".close-button");
  submaterialCloseButton.addEventListener('click', (event) => {
    if (!event.target) { return; }
    const submaterialControls = event.target.parentNode;
    submaterialControls.classList.add("hidden");
  });

  // Rig up Submaterial Controls' Add button to work recursively
  const submaterialAddButton = newMaterialTemplate.querySelector(".submaterial-controls .add-button");
  if (!existingMaterial) { // We shouldn't add subMaterials to duplicates of Materials until a proper Edit solution is in place.
    submaterialAddButton.addEventListener('click', (event) => { addNewSubMaterial(event, newMaterial); });
  }

  console.log(newMaterial);

  clearMaterialInput();

  if (parentMaterial) {
    const newMaterialArray = [
      newMaterial,
      newMaterial.Count
    ];
    parentMaterial.Materials.push(newMaterialArray);
    if (parentMaterial.Element) {
      const parentMaterialList = parentMaterial.Element.querySelector(".material-list");
      if (parentMaterialList) {
        parentMaterialList.append(newMaterialTemplate);
        if (parentMaterialList.classList.contains("list-empty")) {
          parentMaterialList.classList.remove("list-empty");
        }
      }
    }
  } else {
    newMaterials.push(newMaterial);
    document.getElementById("newMaterialList").append(newMaterialTemplate);
  }

  if (!existingMaterial) {
    uniqueNewMaterials.push(newMaterial);
  }
}
addMaterialButton.addEventListener('click', (event) => { addNewMaterial(); });

function clearNewMaterials() {
  for (const newMaterial of newMaterials) {
    if (newMaterial.Element) {
      newMaterial.Element.remove();
      newMaterial.Element = null;
    }
  }
  newMaterials = [];
  uniqueNewMaterials = [];
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
  newMaterialFields[5].textContent = newMaterial.TimeStart;
  newMaterialFields[5].textContent += (newMaterial.TimeEnd != "") ? " - " + newMaterial.TimeEnd : "";
  // TimeAMPM
  newMaterialFields[6].textContent = (newMaterial.TimeAMPM) ? "AM/PM" : "";
}

const addRecipePanel = document.getElementById("addRecipePanel");
document.getElementById("closePanel").addEventListener('click', (event) => {
  addRecipePanel.style.display = "none";
});
document.getElementById("addRecipe2").addEventListener('click', (event) => {
  addRecipePanel.style.display = "block";
})
