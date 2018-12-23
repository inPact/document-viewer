Docs module is a module which ouputs the user an HTML template according to the data the user inputs.

There are some dependencies you should install:

     <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"> 

or other moment framework library in order to use the time conventions.

Next, you should add all the dependencies :

    <script src="../tlog-docs-template/tlogDocsService.js"></script>
    <script src="../tlog-docs-template/templateBuilderService.js"></script>
    <script src="../tlog-docs-template/tlogDocsTranslate.js"></script>
    <script src="../tlog-docs-template/tlogDocsUtils.js"></script>
    <script src="../tlog-docs-template/billService.js"></script>

and add the specific css file:

    <link rel="stylesheet" href="../tlog-docs-template/tlogDocsTemplate.css">

**The styling depends on your system direction: ltr or rtl, and using flexbox it will change direction depends on the locals(language) automatically**

NOTE: it is recommanded to add the dependencies and the css file in the head tag and before your execution file 


There is a need for some input parameters in order the module to work:
1. TLOG data;
2. print data
3. isUS boolean property to decide in what country
4. a locale to decalre the language

**** USING THE MODULE *****

When using the Module, first init it:

var service   = new TlogDocsService({
    isUS: _isUS,
    local: 'he-IL'
});

Next, declare documents dictionary.

Afterwards, for getting the number of documents use : 

var docs = tlogDocsService.getDocs(tlogObject, printData);

the docs will have the list of documents from which you can choose single document.
using those documents you will be able to create buttons for toggle

**Suggestion**
For resolving the data that will be sent from the server create array and use the createDocRequests method for getting specific document request.

**End of Suggestion**

You can now create your buttons for toggling between the different documents.

Now, getting the template using buttons: 

NOTE: you can declare the first document in the array on the start of the page , it will be the order itself.

Now, getting the template: 

var tpl = tlogDocsService.getTemplate(button, printData, printData);

the first parameter is the specific  document  you want with the data inside it, the second and the third parameter are the same(will be fixed in the next version, duplicate because of historic reasons) is the print data object;


you can use the example in app.js and index html to inser the template into your code.
you can decide what the width of the template.