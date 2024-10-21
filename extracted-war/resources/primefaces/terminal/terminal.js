PrimeFaces.widget.Terminal=PrimeFaces.widget.BaseWidget.extend({init:function(a){this._super(a);this.promptContainer=this.jq.find("> div:last-child > span.ui-terminal-prompt");this.cfg.prompt=this.promptContainer.text();this.content=this.jq.children(".ui-terminal-content");this.input=this.promptContainer.next("");this.commands=[];this.commandIndex=0;this.promptContainerParent=this.promptContainer.parent();this.bindEvents()},bindEvents:function(){var a=this;this.input.on("keydown.terminal",function(c){var b=$.ui.keyCode;switch(c.which){case b.UP:if(a.commandIndex>0){a.input.val(a.commands[--a.commandIndex])}c.preventDefault();break;case b.DOWN:if(a.commandIndex<(a.commands.length-1)){a.input.val(a.commands[++a.commandIndex])}else{a.commandIndex=a.commands.length;a.input.val("")}c.preventDefault();break;case b.ENTER:case b.NUMPAD_ENTER:a.processCommand();c.preventDefault();break}});this.jq.on("click",function(){a.focus()})},processCommand:function(){this.commands.push(this.input.val());this.commandIndex++;var b=$("<div></div>");b.append("<span>"+this.cfg.prompt+'</span><span class="ui-terminal-command"></span>').appendTo(this.content);b.find(".ui-terminal-command").text(this.input.val());this.promptContainerParent.hide();var c=this,a={source:this.id,update:this.id,process:this.id,params:[{name:this.id+"_command",value:true}],onsuccess:function(f,d,e){PrimeFaces.ajax.Response.handle(f,d,e,{widget:c,handle:function(g){c.input.val("");c.promptContainerParent.show();if(PrimeFaces.env.isIE()){window.setTimeout(function(){c.focus()},50)}else{c.focus()}c.processResponse(g)}});return true}};PrimeFaces.ajax.Request.handle(a)},focus:function(){this.input.trigger("focus")},clear:function(){this.content.html("");this.input.val("")},processResponse:function(a){$("<div></div>").text(a).appendTo(this.content.children().last());this.jq.scrollTop(this.jq[0].scrollHeight)}});