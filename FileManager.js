var FileManager = {
  filesList : [],
  flag : true,
  init: function() {
      window.onload = function() {
      var dropBox = document.getElementById("dropBox");
      dropBox.ondragenter = FileManager.ignoreDrag;
      dropBox.ondragover = FileManager.ignoreDrag;
      dropBox.ondrop = FileManager.drop;

      var headerEl = document.getElementById("header");
      FileManager.section = document.querySelectorAll('#header th');
      [].forEach.call(FileManager.section, function(item) { item.dataset.state = 'increase'; });
      headerEl.addEventListener('click', FileManager.sortHandler, false);

      document.body.ondragenter = FileManager.handleDragOver;
      document.body.ondragover = FileManager.handleDragOver;
      document.body.ondrop = FileManager.removeElement;
    };
  },

  handleDragStart: function(e) {
    FileManager.dragEl = this;
  },

  handleDragOver: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  removeElement: function(e) {
    e.stopPropagation();
    e.preventDefault();
    var index = FileManager.dragEl.dataset.index;
    FileManager.filesList.splice(index, 1);
    FileManager.dragEl.remove();
  },

  ignoreDrag: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  drop: function(e) {
    e.stopPropagation();
    e.preventDefault();

    var data = e.dataTransfer;
    var files = data.files;

    FileManager.processFiles(files);
  },
  //проверка уникальности элементов массива
  testUnique: function(array) {   
    var n = array.length;
    for (var i = 0; i < n-1; i++) { 
      for (var j = i+1; j < n; j++) {
        if (array[i].name === array[j].name) {
          array.splice(j, 1);
          alert('Этот файл уже есть в списке');
        } 
      }
    }
  },

  processFiles: function(files) {
    console.log(this);
    //время создания
    var time = new Date();
    //определение размера файла
    //var fileSize = file.size;
    var reader = new FileReader();
    //запись данных в массив
    for(var i=0; i<files.length; i++) {
      var file = files[i];
      this.filesList.push({name: file.name, size: file.size, time: time.toLocaleString()});
    }
    this.testUnique(this.filesList);
    //начальная сортировка по имени и сортировка при добавлении
    if(this.flag) {
      this.sortByIncrease('name');
      this.section[0].className = "increase";
      this.section[0].dataset.state = 'decrease';
      this.flag = false;
    } else {
      [].forEach.call(FileManager.section, function(item) { 
        if(item.className !== '') {
          var value = item.dataset.val;
          if (item.className === 'increase') {
            FileManager.sortByIncrease(value);
          } else {
            FileManager.sortByDecrease(value);
          }
        }
      });
    }
    reader.onload = function (event) {
      FileManager.render(FileManager.filesList);
    };
    reader.onerror = function(event) {
      console.error("Файл не может быть прочитан! код " + event.target.error.code);
    };
    reader.readAsText(file);
  },
  //функции сортировки
  sortByIncrease: function(val) {
    if (val == 'name') {
      this.filesList.sort(function(a, b) {
        if (a[val].toLowerCase() > b[val].toLowerCase()) return 1;
        if (a[val].toLowerCase() < b[val].toLowerCase()) return -1;
      });
    } else {
      this.filesList.sort(function(a, b) {
        if (a[val] > b[val]) return 1;
        if (a[val] < b[val]) return -1;
      });
    }
  },
  sortByDecrease: function(val) {
    if (val == 'name') {
      this.filesList.sort(function(a, b) {
        if (a[val].toLowerCase() < b[val].toLowerCase()) return 1;
        if (a[val].toLowerCase() > b[val].toLowerCase()) return -1;
      });
    } else {
      this.filesList.sort(function(a, b) {
        if (a[val] < b[val]) return 1;
        if (a[val] > b[val]) return -1;
      });
    }
  },

  render: function(array) {
    var output = document.getElementById("content");
    output.innerHTML = '';
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
      output.insertAdjacentHTML('beforeend', '<tr draggable="true" data-index="' + i + '"><td draggable="true">' + arr[i].name + '</td><td>' + fileSize + '</td><td>' + arr[i].time + '</td></tr>');
      var listEl = document.querySelectorAll('#content tr');
      [].forEach.call(listEl, function(item) {
        item.ondragstart = FileManager.handleDragStart;
      });
    });
  },

  sortHandler: function(event) {
    console.log(this);
    var el = event.target,
      val = el.dataset.val,
      state = el.dataset.state;
    [].forEach.call(FileManager.section, function(item) { item.className = ''; });
    if(state == 'increase') {
      FileManager.sortByIncrease(val);
      FileManager.render(FileManager.filesList);
      el.className = "increase";
      el.dataset.state = 'decrease';
    } else {
      FileManager.sortByDecrease(val);
      FileManager.render(FileManager.filesList);
      el.className = "decrease";
      el.dataset.state = 'increase';
    }
  },

  serialize: function() {
    return this.filesList;
  }
};