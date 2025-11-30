import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

// Launch app
document.addEventListener("readystatechange", function (event) {
	if (event.target.readyState == "complete") {
		initApp();
	}
})

const initApp = function () {
	//add listeners
	const itemEntryForm = document.getElementById("itemEntryForm")
	itemEntryForm.addEventListener("submit", function (event) {
		console.log("submit prevented")
		event.preventDefault()
		processSubmission()
	});

	const clearItems = document.getElementById("clearItems");
	clearItems.addEventListener('click', function () {
		const list = toDoList.getList();
		if (list.length) {
			const confirmed = confirm("Are you sure you want to clear the entire list?");
			if (confirmed) {
				toDoList.clearList();
				updatePersistentData(toDoList.getList())
				refreshThePage();
			}
		}
	})
	//Procedural
	//load list object
	loadListObject();
	//refresh the page
	refreshThePage();
}

const loadListObject = function () {
	const storedList = localStorage.getItem("myToDoList");
	if (typeof storedList != "string") return;
	const parsedList = JSON.parse(storedList);
	parsedList.forEach(function (itemObj) {
		const newToDoItem = createNewItem(itemObj._id, itemObj._item);
		toDoList.addItemToList(newToDoItem);
	})
}
function refreshThePage() {
	clearListDisplay();
	renderList();
	clearItemEntryField();
	setFocusOnItemEntry();
}

const clearListDisplay = function () {
	const parentElement = document.getElementById("listItems")
	deleteContents(parentElement);
}

const deleteContents = function (parentElement) {
	let child = parentElement.lastElementChild;
	while (child) {
		parentElement.removeChild(child);
		child = parentElement.lastElementChild;
	}
}

const renderList = function () {
	const list = toDoList.getList();
	list.forEach(function (item) {
		buildListItem(item);
	})
}

const buildListItem = function (item) {
	const div = document.createElement("div");
	div.className = "item";
	const check = document.createElement("input");
	check.type = "checkbox"
	check.id = item.getId();
	check.tabIndex = 0;
	addClickListenerToCheckbox(check);
	const label = document.createElement("label");
	label.htmlFor = item.getId();
	label.textContent = item.getItem();
	div.appendChild(check);
	div.appendChild(label);
	const container = document.getElementById("listItems")
	container.appendChild(div);
}

const addClickListenerToCheckbox = function (checkbox) {
	checkbox.addEventListener("click", function (event) {
		toDoList.removeItemFromList(checkbox.id);
		updatePersistentData(toDoList.getList())
		const removedText = getLabelText(checkbox.id);
		updateScreenReaderConfirmation(removedText, "removed from list");
		setTimeout(function () {
			refreshThePage()
		}, 1000)
	})
}


const getLabelText = function(checkboxId) {
	return document.getElementById(checkboxId).nextElementSibling.textContent;
}
const updatePersistentData = function (listArray) {
	localStorage.setItem("myToDoList", JSON.stringify(listArray));

}
const clearItemEntryField = function () {
	document.getElementById("newItem").value = "";
}

const setFocusOnItemEntry = function () {
	document.getElementById("newItem").focus();
}

const processSubmission = function () {
	const newEntryText = getNewEntry();
	if (!newEntryText.length) return;
	const nextItemId = calcNextItemId();
	const toDoItem = createNewItem(nextItemId, newEntryText);
	toDoList.addItemToList(toDoItem);
	updatePersistentData(toDoList.getList());
	updateScreenReaderConfirmation(newEntryText, "added");
	refreshThePage();
}

const getNewEntry = function () {
	return document.getElementById("newItem").value.trim()
}

const calcNextItemId = function () {
	let nextItemId = 1
	const list = toDoList.getList()
	if (list.length > 0) {
		nextItemId = list[list.length - 1].getId() + 1
	}
	return nextItemId
}

const createNewItem = function (itemId, itemText) {
	const toDo = new ToDoItem();
	toDo.setId(itemId)
	toDo.setItem(itemText)
	return toDo
}

const updateScreenReaderConfirmation = function(newEntryText, actionVerb){
	document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
}
