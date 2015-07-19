function FileManager(options) {
  var filesList =  [],
      elem, contentElem, inputElem, titleElem, wrapperEl,
      that = this;
      processFiles.firstCall = true;
  this.init = function() {
    
    render();

    if(options.files) processFiles(options.files);

    elem.ondragenter = ignoreDrag;
    elem.ondragover = ignoreDrag;
    elem.ondrop = drop;

    inputElem.onchange = function(e) {
          var files = e.target.files;
          processFiles(files);
      }

    contentElem.ondragstart = handleDragStart;

    document.body.ondragenter = ignoreDrag;
    document.body.ondragover = ignoreDrag;
		
  };

  //функция проверки уникальности элементов массива
  function testUnique(array) {   
    var n = array.length;
    for (var i = 0; i < n-1; i++) { 
      for (var j = i+1; j < n; j++) {
        if (array[j] && array[i].name === array[j].name) {
          array.splice(j, 1);
          alert('Этот файл уже есть в списке');
        } 
      }
    }
  }

   function processFiles(files) {
    //время создания
    var time = new Date();
    //запись данных в массив
    for(var i=0; i<files.length; i++) {
      var file = files[i];
			var date = new Date(file.lastModified).toLocaleString();
			console.log(date);
      filesList.push({name: file.name, size: file.size, time: date});
    }
    //проверка уникальности элементов массива
    testUnique(filesList);
    //начальная сортировка по имени и сортировка при добавлении
    if(processFiles.firstCall) {
      sortByIncrease('name');
			[].forEach.call(titleElem, function(item) { 
				item.className = '';
			});
      titleElem[0].className = "increase";
      titleElem[0].dataset.state = 'decrease';
      processFiles.firstCall = false;
    } else {
        [].forEach.call(titleElem, function(item) { 
            if(item.className !== '') {
              var value = item.dataset.val;
              if (item.className == 'increase') {
                sortByIncrease(value);
              } else {
                sortByDecrease(value);
              }
            }
        });
    }
	renderItems(filesList);
  }
  //функции сортировки
  function sortByIncrease(val) {
    if (val == 'name') {
      filesList.sort( function(a, b) {
        return a[val].toLowerCase() > b[val].toLowerCase() ? 1 : -1;
      });
    } else {
      filesList.sort( function(a, b) {
        return a[val] > b[val] ? 1 : -1;
      });
    }
  }
  function sortByDecrease(val) {
    if (val == 'name') {
      filesList.sort(function(a, b) {
        return a[val].toLowerCase() < b[val].toLowerCase() ? 1 : -1;
      });
    } else {
      filesList.sort(function(a, b) {
        return a[val] < b[val] ? 1 : -1;
      });
    }
  }

	function render() {
		wrapperEl = document.createElement('div');
    wrapperEl.setAttribute('id', options.id + 'Wrapper');
		
		elem = document.createElement('table');
		elem.className = 'table';
		elem.setAttribute('id', options.id);
		
		var headerElem = document.createElement('thead');
		headerElem.className = 'table_header';
		
		var trElem = document.createElement('tr');
		
		titleElem = [];
		for(var i=0;i<3;i++) {
			titleElem[i] = document.createElement('th');
			trElem.appendChild(titleElem[i]);
		}
		titleElem[0].dataset.val = 'name';
		titleElem[0].textContent = 'Name';
		titleElem[1].dataset.val = 'size';
		titleElem[1].textContent = 'Size';
		titleElem[2].dataset.val = 'time';
		titleElem[2].textContent = 'Date modified';
		
		contentElem = document.createElement('tbody');
		contentElem.className = 'table_content';
		
		inputElem = document.createElement('input');
		inputElem.className = 'widget_fileInput';
		inputElem.setAttribute('type', 'file');
		inputElem.setAttribute('multiple', '');
		
		headerElem.appendChild(trElem);
		elem.appendChild(headerElem);
		elem.appendChild(contentElem);
		wrapperEl.appendChild(elem);
		wrapperEl.appendChild(inputElem);
		document.body.appendChild(wrapperEl);
		
		titleElem.forEach(function(item) { item.dataset.state = 'increase'; });
		
		headerElem.addEventListener('click', sortHandler, false);
	}

  function renderItems(array) {
    contentElem.innerHTML = '';
    array.forEach(function(item, i, arr) {
      var fileSize = arr[i].size;
      if ( fileSize >= 1024 && fileSize < 1048576 ) {
        fileSize = Math.round(fileSize/1024 * 10) / 10 + ' Кб';
      } else if (fileSize >= 1048576 && fileSize < 1073741824 ) {
        fileSize = Math.round(fileSize/1048576 * 10) / 10 + ' Мб';
      } else if (fileSize >= 1073741824) {
        fileSize = Math.round(fileSize/1073741824 * 10) / 10 + ' Гб';
      } else {
        fileSize = fileSize + ' байт';
      }
      contentElem.insertAdjacentHTML('beforeend', '<tr draggable="true" data-index="' + i + '"><td draggable="true">' + arr[i].name + '</td><td draggable="true">' + fileSize + '</td><td draggable="true">' + arr[i].time + '</td></tr>');
    });
  }

  this.serialize = function() {
    return filesList;
  }

  //обработчики
  function sortHandler(event) {
    var el = event.target,
        val = el.dataset.val,
        state = el.dataset.state;
    [].forEach.call(titleElem, function(item) { 
        item.className = '';
        item.dataset.state = 'increase';
      });
    if(state == 'increase') {
        sortByIncrease(val);
        renderItems(filesList);
        el.className = "increase";
        el.dataset.state = 'decrease';
    } else { 
        sortByDecrease(val);
        renderItems(filesList);
        el.className = "decrease";
        el.dataset.state = 'increase';
    }
  }

  function handleDragStart(e) { 
    var target = e.target;
    if (target.tagName == 'TR') {
      var index = target.dataset.index;
    } else if (target.tagName == 'TD') {
      var index = target.closest('tr').dataset.index;
    };
    var id = target.closest('table').id;
    var data = {
      id: id,
      index: index,
      file: filesList[index]
    }; 
    e.dataTransfer.setData('text', JSON.stringify(data));
		document.body.addEventListener('drop', removeElement, false);
  };
	
  function removeElement(e) {
    e.stopPropagation();
    e.preventDefault();
    var target = e.target;
		console.log(target);
    var data = JSON.parse(e.dataTransfer.getData('text'));
//    console.log(data);
//    var id = data.id;
    var index = parseInt(data.index);
//    filesList = data.files;
    filesList.splice(index, 1);
//    var targetEl = document.querySelector("#" + id + " .table_content");
    renderItems(filesList);
  };

  function ignoreDrag(e) {
    e.stopPropagation();
    e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
  };

  function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var data = e.dataTransfer;
    var files = data.files;

    processFiles(files);

    if (e.dataTransfer.getData('text')) {
        var droppedData = JSON.parse(e.dataTransfer.getData('text'));
        var file = droppedData.file;
				if (droppedData.id == options.id) {
					return;
				} else {
					filesList.push(file);
					processFiles(file);
				}
    }
    
  };
};