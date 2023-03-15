
/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2023 Yannis Charalambidis
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */


let undoList = [];
let redoList = [];

function undo() {
  resetSelectedElement();
  if (undoList.length == 0) {
    return;
  }

  pushToRedo();
  setFromUndo();
}

function printHistory() {
  console.log("UNDO LIST", undoList);
  console.log("REDO LIST", redoList);
}

function redo() {
  resetSelectedElement();
  if (redoList.length == 0) {
    return;
  }

  pushToUndo();
  setFromRedo();
}

function pushToUndo() {
  let r = document.getElementById("rblock");
  undoList.push(r.cloneNode(true));
}

function pushToRedo() {
  let r = document.getElementById("rblock");
  redoList.push(r.cloneNode(true));
}

function setFromUndo() {
  let el = undoList[undoList.length - 1];
  let or = document.getElementById("canvas");
  or.innerHTML = '';
  or.appendChild(el);

  undoList.pop();

  let dr = document.getElementById("rblock").lastElementChild;
  if (dr.children.length == 0) {
    setDropareaDefaultColor(dr);
  }
}

function setFromRedo() {
  let el = redoList[redoList.length - 1];
  let or = document.getElementById("canvas");
  or.innerHTML = '';
  or.appendChild(el);

  redoList.pop();
}

function clrCanvas() {
  // document.getElementById("rblock").getElementsByClassName("drop-before-end")[0].innerHTML = '';
  let canvas = document.getElementById("canvas");
  canvas.innerHTML = '<div id="rblock" class="dblock program"><textarea rows="1" placeholder="Program" ondrop="return false;" oninput="textareaResize(event);"></textarea><div class="droparea drop-before-end" ondrop="drop(event)" ondragover="allowDrop(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)"></div></div>';
}

function clearCanvas() {
  resetSelectedElement();
  undoList = [];
  redoList = [];

  if (confirm("Unsaved changes will be lost.")) {
    clrCanvas();
  }
}

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.code == "Delete") {
    event.preventDefault();
    clearCanvas();
  } else if (event.key == "Delete") { // DELETE
    event.preventDefault();
    removeElement();
  }
  if (event.ctrlKey && (event.key === "z" || event.key === "Z"))  { // CTRL Z
    event.preventDefault();
    undo();
  }
  if (event.ctrlKey && (event.key === "y" || event.key === "Y")) { // CTRL Y
    event.preventDefault();
    redo();
  }
  if (event.ctrlKey && (event.key === "o" || event.key === "O")) { // CTRL O
    event.preventDefault();
    upload();
  }
  if (event.ctrlKey && (event.key === "s" || event.key === "S")) { // CTRL S
    event.preventDefault();
    save();
  }
  if (event.ctrlKey && (event.key === "a" || event.key === "A")) { // CTRL A
    event.preventDefault();
    centerCanvas();
  }
  if (event.ctrlKey && (event.key === "p" || event.key === "P")) { // CTRL P
    event.preventDefault();
    printContent();
  }
  if (event.ctrlKey && (event.key === "e" || event.key === "E")) { // CTRL E
    event.preventDefault();
    getImage();
  }

});


setAllTriangles();

var canvas = document.getElementById("canvas");

let instance = panzoom(canvas, {
  maxZoom: 2,
  minZoom: 0.3,
  zoomDoubleClickSpeed: 1,
  smoothScroll: false,
  beforeMouseDown: function(e) {
    // allow mouse-down panning only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.altKey;
    return shouldIgnore;
  },
  beforeWheel: function(e) {
    // allow wheel-zoom only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.altKey;
    return shouldIgnore;
  },
  filterKey: function(/* e, dx, dy, dz */) {
    // don't let panzoom handle this event:
    return true;
  }
});

let origin = instance.getTransformOrigin();


function centerCanvas() {
  instance.smoothMoveTo(0, 0);
}

lastDrop = Date.now()

/*
function resetColors(target) {

  if (target.classList.contains("drop-before-begin") ||
    target.classList.contains("dinput") ||
    target.classList.contains("drop-before-end")) {
    target.style.backgroundColor = "transparent";
  } else {
    target.style.backgroundColor = "white";
  }

  if (target.classList.contains("drop-before-end") && target.classList.contains("droparea")) {
    darea = target.getElementsByClassName("droparea")[0];
    console.log(darea);
    if (darea.children.length === 0) {
      console.log(target);
      darea.style.borderColor = "#7f7f7f";
    } else {
      darea.style.borderColor = "white";
    }

  }

}

*/


function setDropareaDefaultColor(dr) {
  if (dr == null) {
    return;
  }

  if (dr.classList.contains("droparea")) {
    if (dr.classList.contains("drop-before-begin")) {
      dr.style.backgroundColor = "transparent";
    } else {
      dr.style.backgroundColor = "white";
    }
    dr.style.borderColor = "#7f7f7f";

  }
}

function setDropareaSelectedColor(dr) {
  if (dr == null) {
    return;
  }

  if (!isElementInRblock(dr)) {
    return false;
  }

  if (dr.classList.contains("droparea")) {
    dr.style.backgroundColor = "red";
    dr.style.borderColor = "red";
  }
}

/*
function setDropBeforeEndTransparent(dr) {
  if (dr == null) {
    return;
  }

  if (dr.classList.contains("droparea")) {
    dr.style.backgroundColor = "white";
    dr.style.borderColor = "#7f7f7f";
  }
} */


function setDBE(dr) {
  if (dr == null) {
    return false;
  }

  if (!isElementInRblock(dr)) {
    return false;
  }


  let dbe = getDropBeforeEnd(dr);
  if (dbe == null) {
    return false;
  }

  dbe.style.backgroundColor = "red";
  dbe.style.borderColor = "red";
  dbe.style.paddingBottom = "2rem";


}

function unsetDBE(dr) {
  if (dr == null) {
    return false;
  }


  let dbe = getDropBeforeEnd(dr);
  if (dbe == null) {
    return false;
  }

  dbe.style.backgroundColor = "white";
  dbe.style.borderColor = "#7f7f7f";
  dbe.style.paddingBottom = "";
  return true;
}

function dragEnter(ev) {
  if (!isElementInRblock(ev.target)) {
    setDropareaDefaultColor(ev.target);
    return;
  }

  if (!setDBE(ev.target) && ev.target.classList.contains("droparea")) {
    setDropareaSelectedColor(ev.target);
  }


}

function dragLeave(ev) {
  if (!isElementInRblock(ev.target)) {
    setDropareaDefaultColor(ev.target);
    return;
  }

  if (!unsetDBE(ev.target) && ev.target.classList.contains("droparea")) {
    setDropareaDefaultColor(ev.target);
  }

  // If drop-before-end is empty
  /*if (ev.target.children.length === 0 && ev.target.classList.contains("drop-before-end")) {
    setDropareaDefaultColor(ev.target);
  } else {
    setDropBeforeEndTransparent(ev.target);
  }*/

}

function allowDrop(ev) {
  if (!isElementInRblock(ev.target)) {
    return;
  }
  setDBE(ev.target);

  ev.preventDefault();
}

function drag(ev) {
  ev.target.style.backgroundColor = "white";
  ev.dataTransfer.setData("text", ev.target.outerHTML);
}

function drop(ev) {
  if (!isElementInRblock(ev.target)) {
    return;
  }

  d = Date.now()
  if (d - lastDrop < 1000) {
    return;
  }
  lastDrop = d;


  target = ev.target;

  let dbe = getDropBeforeEnd(ev.target);
  if (dbe != null) {
    target = dbe;
  }

  if (target.classList.contains("droparea") && target.tagName != "input") {
    setDropareaDefaultColor(target);
    target.style.borderColor = "transparent";

    redoList = [];
    pushToUndo();

    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    let newNode = null;

    if (target.classList.contains("drop-before-begin")) {
      target.parentElement.insertAdjacentHTML('beforebegin', data);
      newNode = target.parentElement.previousSibling;
    } else {
      target.insertAdjacentHTML('beforeend', data);
      newNode = target.lastChild;
    }

    if (newNode.nodeName == "#text") {
      setDropareaDefaultColor(newNode.parentElement);
      setFromUndo();
      newNode.remove();
    } else {
      if (newNode.classList.contains("decision-item")) {
        setFromUndo();
        newNode.remove();
      }

      if (newNode.classList.contains("parallel-item")) {
        setFromUndo();
        newNode.remove();
      }

      if (target.classList.contains("decision")) {
        setDecisionTriangle(target);
      }
    }


    unselectAllElementsFromDroparea(target);



  }


  unsetDBE(dbe);
  setAllTriangles();
}

function decisionDrop(ev) {
  if (!isElementInRblock(ev.target)) {
    return;
  }

  setDropareaDefaultColor(ev.target);
  unselectAllElementsFromDroparea(ev.target);
  unsetDBE(ev.target);

  d = Date.now()
  if (d - lastDrop < 1000) {
    return;
  }
  lastDrop = d;

  ev.preventDefault();

  var data = ev.dataTransfer.getData("text");

  let parent = getParentDBlock(ev.target);

  if (parent.classList.contains("decision")) {
    let dNode = document.createElement("div");
    dNode.insertAdjacentHTML('beforeend', data);

    let newNode = dNode.firstElementChild;

    if (newNode.classList.contains("decision-item")) {
      let lastBranch = parent.getElementsByClassName("decision-branches")[0].lastElementChild;
      let copy = lastBranch.cloneNode(true);
      copy.lastElementChild.innerHTML = '';
      copy.firstElementChild.value = '';
      copy.firstElementChild.placeholder = "Default";
      console.log(copy);
      lastBranch.after(copy);

    }

    newNode.remove();
  }

  setAllTriangles();
}

function parallelDrop(ev) {
  setDropareaDefaultColor(ev.target);
  unselectAllElementsFromDroparea(ev.target);
  unsetDBE(ev.target);

  d = Date.now()
  if (d - lastDrop < 1000) {
    return;
  }
  lastDrop = d;

  ev.preventDefault();

  var data = ev.dataTransfer.getData("text");

  let parent = getParentDBlock(ev.target);

  if (parent.classList.contains("parallel")) {
    let dNode = document.createElement("div");
    dNode.insertAdjacentHTML('beforeend', data);

    let newNode = dNode.firstElementChild;

    if (newNode.classList.contains("parallel-item")) {
      let lastBranch = parent.getElementsByClassName("decision-branches")[0].lastElementChild;
      let copy = lastBranch.cloneNode(true);
      copy.firstElementChild.innerHTML = '';
      lastBranch.after(copy);

    }

    newNode.remove();
  }

}

function setAllTextareaValuesToPlaceholder() {
  let tareas = document.getElementsByTagName("textarea");

  for (let i = 0; i < tareas.length; ++i) {
    if (tareas[i].value == '') {
      tareas[i].value = tareas[i].placeholder;
    }
  }
}

function setAllTextareaValuesToEmptyIfNoValue() {
  let tareas = document.getElementsByTagName("textarea");

  for (let i = 0; i < tareas.length; ++i) {
    if (tareas[i].value == tareas[i].placeholder) {
      tareas[i].value = '';
    }
  }
}

function hideParallelLines() {
  let top = document.getElementsByClassName("parallel-top");
  let bottom = document.getElementsByClassName("parallel-bottom");

  for (let i = 0; i < top.length; ++i) {
    top[i].querySelector("div:first-child").style.display = "none";
    top[i].querySelector("div:last-child").style.display = "none";
  }

  for (let i = 0; i < bottom.length; ++i) {
    bottom[i].querySelector("div:first-child").style.display = "none";
    bottom[i].querySelector("div:last-child").style.display = "none";
  }

}

function showParallelLines() {
  let top = document.getElementsByClassName("parallel-top");
  let bottom = document.getElementsByClassName("parallel-bottom");

  for (let i = 0; i < top.length; ++i) {
    top[i].querySelector("div:first-child").style.display = "block";
    top[i].querySelector("div:last-child").style.display = "block";
  }

  for (let i = 0; i < bottom.length; ++i) {
    bottom[i].querySelector("div:first-child").style.display = "block";
    bottom[i].querySelector("div:last-child").style.display = "block";
  }
}


function getImage() {
  resetSelectedElement();
  document.getElementById("png").disabled = true;
  instance.on('zoomend', function(e) {
    setAllTextareaValuesToPlaceholder();
    html2canvas(document.querySelector("#rblock")).then(canvas => {
      let rootElement = document.getElementById("rblock");

      let filename = rootElement.querySelector("textarea").value;
      if (filename === '') {
        filename = "diagram";
      }

      var img = canvas.toDataURL("image/png");

      var link = document.createElement('a');
      link.download = filename + '.png';
      link.href = img;

      link.click();

      setAllTextareaValuesToEmptyIfNoValue();
      /* showParallelLines(); */
      document.getElementById("png").disabled = false;
    });
  });


  instance.moveTo(0, 0);
  instance.smoothZoom(0, 0, 100);


  instance.on('zoomend', function(e) { });
}

function setAllTriangles() {
  t = document.getElementsByClassName("triangles");

  for (let i = 0; i < t.length; ++i) {

    let leftLine = t[i].lastElementChild;
    let rightLine = t[i].firstElementChild;
    let branches = t[i].nextElementSibling;
    let lastBranch = t[i].nextElementSibling.lastElementChild;

    let newLeftLineWidth = (lastBranch.clientWidth / branches.clientWidth) * 100;
    leftLine.style.width = newLeftLineWidth + '%';
    rightLine.style.width = (100 - newLeftLineWidth) + '%';
  }
}

function setAllTrianglesZero() {
  t = document.getElementsByClassName("triangles");

  for (let i = 0; i < t.length; ++i) {

    let leftLine = t[i].lastElementChild;
    let rightLine = t[i].firstElementChild;

    leftLine.style.width = 0 + '%';
    rightLine.style.width = 0 + '%';
  }

}

function setDecisionTriangleZero(newNode) {
  tr = [
    newNode.getElementsByClassName("trig1")[0],
    newNode.getElementsByClassName("trig2")[0],
    newNode.getElementsByClassName("trig3")[0],
    newNode.getElementsByClassName("trig4")[0]
  ];

  tr[0].style.borderRightWidth = 0;

  tr[1].style.borderRightWidth = 0;

  tr[2].style.borderLeftWidth = 0;

  tr[3].style.borderLeftWidth = 0;
}

function setDecisionTriangle(newNode) {
  tr = [
    newNode.getElementsByClassName("trig1")[0],
    newNode.getElementsByClassName("trig2")[0],
    newNode.getElementsByClassName("trig3")[0],
    newNode.getElementsByClassName("trig4")[0]
  ];


  let parentWidth = tr[0].parentElement.offsetWidth;
  let branches = tr[0].parentElement.parentElement.getElementsByClassName("decision-branches")[0].children;
  let lastBranch = branches[branches.length - 1];


  let lastBranchWidth = lastBranch.clientWidth;

  tr[0].style.borderLeftColor = "#7f7f7f";
  tr[0].style.borderBottomColor = "#7f7f7f7";
  tr[0].style.borderRightWidth = parentWidth - lastBranchWidth - 5;

  tr[1].style.top = "4px";
  tr[1].style.borderRightWidth = parentWidth - lastBranchWidth - 5;

  tr[2].style.top = "8px";
  tr[2].style.left = 0;
  tr[2].style.borderLeftWidth = lastBranchWidth - 5;

  tr[3].style.top = "5px";
  tr[3].style.borderLeftWidth = lastBranchWidth;
  tr[3].style.left = -lastBranchWidth;
  tr[3].style.borderBottomWidth = "37px";

}


function unselectAllElementsFromDroparea(element) {
  selectedElement = null;
  for (let i = 0; i < element.children.length; ++i) {
    element.children[i].style.backgroundColor = "white";
  }
}

var topIndex = 100;

var selectedElement = null

function isElementInRblock(element) {
  if (element.parentElement == null) {
    return false;
  }

  if (element.parentElement.id == "rblock") {
    return true;
  }
  return (isElementInRblock(element.parentElement));
}

function resetSelectedElement() {
  if (selectedElement != null) {
    selectedElement.style.backgroundColor = "";
  }

  selectedElement = null;
}

document.addEventListener("mousedown", (event) => {
  if (event.target.tagName === "BUTTON") {
    return;
  }

  if (!isElementInRblock(event.target)) {
    resetSelectedElement();
    return;
  }

  if (event.target.tagName === "textarea") {
    return;
  }



  if (event.target.classList.contains("dblock")) {

    if (selectedElement != null) {
      selectedElement.style.backgroundColor = "";
    }

    selectedElement = event.target;
    selectedElement.style.backgroundColor = "#ffebeb";

  } else if (event.target.classList.contains("drop-before-begin")) {
    if (selectedElement != null) {
      selectedElement.style.backgroundColor = "";
    }

    selectedElement = event.target.parentElement;
    selectedElement.style.backgroundColor = "#ffebeb";

  }
});


function removeElement() {
  if (selectedElement != null && isElementInRblock(selectedElement)) {
    redoList = [];
    pushToUndo();
    if (selectedElement.parentElement.children.length === 1) {
      setDropareaDefaultColor(selectedElement.parentElement);
    }
    selectedElement.remove();
    selectedElement = null;

    setAllTrianglesZero();
    setAllTriangles();
  }
}

function disableDraggableParent(ev) {
  if (!isElementInRblock(ev.target)) {
    return;
  }

  if (getParentDBlock(ev.target) == null) {
    return;
  }

  getParentDBlock(ev.target).setAttribute("draggable", "false");
  /* ev.target.parentElement.setAttribute("draggable", "false");*/
}

function enableDraggableParent(ev) {
  if (!isElementInRblock(ev.target)) {
    return;
  }

  if (getParentDBlock(ev.target) == null) {
    return;
  }

  getParentDBlock(ev.target).setAttribute("draggable", "false");
  /* ev.target.parentElement.setAttribute("draggable", "true"); */
}

function getParentDBlock(element) {
  if (element == null || element.parentElement == null) {
    return null;
  }

  if (element.classList.contains("dblock")) {
    return element;
  }

  return getParentDBlock(element.parentElement);
}

function getDropBeforeEnd(element) {
  // If we found the root element of the DOM or another type of droparea found first
  if (element == null || (element.classList.contains("droparea") && !element.classList.contains("drop-before-end"))) {
    return null;
  }

  if (element.classList.contains("drop-before-end")) {
    return element;
  }

  return getDropBeforeEnd(element.parentElement);
}

function save() {
  let rootElement = document.getElementById("rblock");

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(rootElement.outerHTML));

  let filename = rootElement.querySelector("textarea").value;

  if (filename === '') {
    filename = "diagram";
  }
  element.setAttribute('download', filename + ".html");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function applyRootElement(content) {
  document.getElementById("canvas").innerHTML = content;
}

function applyTextareas() {

  t = document.getElementsByTagName("textarea");

  for (let i = 0; i < t.length; ++i) {
    if (isElementInRblock(t[i])) {
      t[i].value = t[i].getAttribute("value");
    }
  }
}

function upload() {
  var input = document.createElement('input');
  input.type = 'file';

  input.onchange = e => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = readerEvent => {
      applyRootElement(readerEvent.target.result);
      applyTextareas();
      setAllTriangles();
    }


  }

  input.click();
}

function printContent() {
  resetSelectedElement();
  if (selectedElement != null) {
    selectedElement.style.backgroundColor = "";
    selectedElement = null;
  }
  instance.moveTo(0, 0);
  instance.zoomTo(0, 0, 0.5);
  setTimeout(() => {
    setAllTriangles();
    window.print();
  }, 1000);
}


function textareaResize(ev) {
  if (!isElementInRblock(ev.target)) {
    ev.target.value = '';
  }
  ev.target.style.boxSizing = 'border-box';
  var offset = ev.target.offsetHeight - ev.target.clientHeight;
  ev.target.style.height = 'auto';
  ev.target.style.height = ev.target.scrollHeight + offset + 'px';

  ev.target.setAttribute("value", ev.target.value);
}

function resetSidebar() {
  let da = document.getElementById("sidebar").getElementsByClassName("droparea");

  for (let i = 0; i < da.length; ++i) {
  }
}

/*
dblocks = document.getElementsByClassName("dblock")
for (let i = 0; i < dblocks.length; ++i) {
  dragElement(dblocks[i])
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.target.style.zIndex = ++topIndex;

    if (e.target.classList.contains("dblock") && !e.target.parentElement.classList.contains("droparea")) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;

    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

*/
