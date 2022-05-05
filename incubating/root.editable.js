
HTMLElement.prototype.editor = null;
HTMLElement.prototype.edit = function() {
    if (this.editor != null) {
        $x(this).hide();
        $x(this.editor).show();
    }
}

$post(function() {

    $a('[editable]').forEach(element => {
        if ('SPAN,A,P,DIV,FONT,B,I,LABEL,H1,H2,H3,H4,H5,H6'.includes(element.nodeName)) {
            //绑定事件到 element
            if (element.getAttribute('edit-on') == null) {
                element.setAttribute('edit-on', 'click');
            }
            Event.interact(element, element);
            
            //绑定事件到 editor
            let editor = element.getAttribute('editable');
            element.editor = (editor != null && editor != '') ? $s(editor) : element.nextElementSibling;
            if (element.editor != null) {
                // $listen(element.editor).on('change+success', function(ev) {
                //     $x(this).hide();
                //     $x(element).html(this.value).show();                    
                // });
                $x(element.editor).hide();
            }

            element.removeAttribute('editable');
        }
    });
});