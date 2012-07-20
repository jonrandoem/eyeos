function MultiFiles(list_target){
	this.list_target = list_target;
	this.count = 0;
	this.id = 0;
	this.currentColor = "#DDDDDD";
	this.addElement = function(element){
		if(element.tagName == 'INPUT' && element.type == 'file'){
			element.name = 'Filedata[' + this.id++ + ']';
			element.multi_selector = this;
			element.onchange = function(){
				var new_element = document.createElement('input');
				new_element.type = 'file';
				this.parentNode.insertBefore(new_element, this);
				this.multi_selector.addElement(new_element);
				this.multi_selector.addListRow(this);
				this.style.display = 'none';
			};
			this.count++;
			this.current_element = element;
		}
	};

	this.addListRow = function(element){
		var new_row = document.createElement('div');
		var new_row_button = document.createElement('input');
		new_row_button.type = 'button';
		new_row_button.value = 'Remove';
		new_row_button.className = 'btnDelete';
		new_row.element = element;
		new_row_button.onclick= function(){
			/*this.parentNode.parentNode.element.parentNode.removeChild(this.parentNode.parentNode.element);
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			this.parentNode.parentNode.element.multi_selector.count--;
			this.parentNode.parentNode.element.multi_selector.current_element.disabled = false;*/
			this.parentNode.element.parentNode.removeChild(this.parentNode.element);
			this.parentNode.parentNode.removeChild(this.parentNode);
			this.parentNode.element.multi_selector.count--;
			this.parentNode.element.multi_selector.current_element.disabled = false;
			return false;
		};
		var new_row_div = document.createElement('div');
		new_row_div.className = 'divFileName';
		new_row_div.innerText = element.value;
		if(new_row_div.innerText) {
			new_row_div.textContent = element.value;
		}
		new_row.style.backgroundColor = this.currentColor;
		if(this.currentColor == "#DDDDDD") {
			this.currentColor = "white";
		} else {
			this.currentColor = "#DDDDDD";
		}
		new_row.appendChild(new_row_button);
		//new_row_div.appendChild(new_row_button);
		new_row.appendChild(new_row_div);
		this.list_target.appendChild(new_row);

	};

};