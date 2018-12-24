


export default class SignatureService {
    constructor() {

    }

    getSignature(docObjChosen, element, doc) {
        this._doc = doc;


        let signatureData = docObjChosen.md.signature;
        console.log(signatureData);

        debugger;

        // function makeSVG(tag, attrs) {
        //     var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        //     for (var k in attrs)
        //         el.setAttribute(k, attrs[k]);
        //     return el;
        // }




        let contenier = this._doc.createElement('div');
        contenier.id = 'signatureDiv';
        contenier.classList += " signature-container";
        contenier.setAttribute("width", "100%");
        contenier.setAttribute("height", "30px");

        let elementSvg = this._doc.createElement('svg');
        elementSvg.setAttribute('id', "svg");
        elementSvg.setAttribute('width', "100%");
        elementSvg.setAttribute('height', "70");
        elementSvg.setAttribute('transform', "translate(0,0)");
        elementSvg.setAttribute('viewBox', "300 50 150 380");
        elementSvg.setAttribute('viewbox', "300 50 150 380");
        elementSvg.setAttribute('view-box', "300 50 150 380");
        elementSvg.setAttribute('style', "width: 100%;");

        // contenier.outerHTML += `<svg id="svg" width="100%" height="70" transform="translate(0,0)" viewBox="300 50 150 380" style="width: 100%;"></svg>`;
        // let elementSvg = elementSVGDiv.getElementsByTagName('svg')[0];

        let path = this.makeSVG('path', { d: signatureData.data, stroke: "#06067f", 'stroke-width': "2", 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });

        elementSvg.appendChild(path);

        contenier.appendChild(elementSvg);

        element.appendChild(contenier);

        return element;


        // let elementSVG = $element.find('svg');
        // let elementParent = $element.parent().parent();
        // let widthsignatureContenier = elementParent.width();
        // widthsignatureContenier = "100%";
        // if (ctrl.printMode) {
        //     widthsignatureContenier = "100%";
        // }

        // var path = makeSVG('path', { d: ctrl.data.data, stroke: "#06067f", 'stroke-width': "2", 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
        // elementSVG.html("");
        // elementSVG.append(path);
        // elementSVG.width(widthsignatureContenier);






        //////////////////////////////////////////////








        // let signatureData = docObjChosen.md.signature;
        // let signatureDiv = this._doc.createElement('div');
        // signatureDiv.id = 'signatureDiv';
        // signatureDiv.classList += " signature-container";

        // let elementSVGDiv = this._doc.createElement('div');
        // elementSVGDiv.id = 'elementSVGDiv'
        // elementSVGDiv.classList += " signature-container";
        // let newSVG = this._doc.createElement('div');
        // newSVG.id = 'newSVG';

        // elementSVGDiv.appendChild(newSVG);
        // newSVG.outerHTML += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id='svg' width='100%' height='auto' transform='translate(0, 0)'  viewBox="0 0 500 150" ></svg>`
        // let svgNode = elementSVGDiv.getElementsByTagName('svg')[0];
        // svgNode.classList += " signature-container";

        // elementSVGDiv.appendChild(svgNode);

        // signatureDiv.appendChild(elementSVGDiv)

        // let elementSVG = signatureDiv.getElementsByTagName('svg')[0];
        // elementSVG.id = 'elementSVG';

        // let path = this.makeSVG('path', { d: signatureData, version: "1.1", xmlns: "http://www.w3.org/2000/svg", stroke: "#06067f", 'stroke-width': "2", height: "auto", transform: 'translate(50,-40) scale(0.4,0.4)', 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
        // path.setAttribute("width", "50%");
        // path.setAttribute("height", "auto");

        // elementSVG.setAttribute("width", "100%");
        // elementSVG.setAttribute("height", "auto");

        // elementSVG.innerHTML = "";
        // elementSVG.appendChild(path);
        // elementSVG.setAttribute("width", "100%");
        // elementSVG.setAttribute("height", "auto");

        // elementSVGDiv.appendChild(elementSVG);
        // element.appendChild(signatureDiv)

        return element;
    }

    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

}