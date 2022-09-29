

import DocumentFactory from '../helpers/documentFactory.service';
import HtmlCreator from '../helpers/htmlCreator.service';

const helper = {
    getDimensionSafe(dimension) {

        let result = dimension;
        let exclude = ["{{", "{", "}}", "}", ","];
        exclude.forEach(item => {
            result = _.replace(result, new RegExp(item, "g"), "");
        });

        return result;
    }
}

export default class SignatureService {

    constructor() {
        this.$htmlCreator = new HtmlCreator();
    }

    getSignature(element) {

        this._doc = DocumentFactory.get();
        let documentInfo = DocumentFactory.getDocumentInfo();

        if (_.get(documentInfo, 'md.signature') === undefined)
            return;

        let signatureData = documentInfo.md.signature;
        let dimension = helper.getDimensionSafe(_.get(signatureData, 'dimension') || '300 -10 150 500');

        let contenier = this.$htmlCreator.create({
            type: 'div',
            id: 'signature-contenier',
            classList: ['signature-container']
        })
        if (documentInfo.md.signature.format === 'image/png') {
            const image = new Image();
            image.src = documentInfo.md.signature.data;
            image.height = '70';
            image.width = '70';
            const imageDiv = document.createElement('div');
            imageDiv.style.display = 'flex';

            imageDiv.style.justifyContent = 'center';
            imageDiv.appendChild(image);
            contenier.appendChild(imageDiv);
            element.appendChild(contenier);

        } else {
            let elementSvg = this.makeSVG('svg', {
                'id': "svg",
                'width': "100%",
                'height': "140",
                'transform': "translate(0,0)",
                'viewBox': dimension,
                'style': "width: 100%;"
            });

            console.log('signatureData.data: ', signatureData.data)
            let path = this.makeSVG('path', {
                d: signatureData.data,
                'stroke': "#06067f",
                'stroke-width': "2",
                'stroke-linecap': "butt",
                'fill': "none",
                'stroke-linejoin': "miter"
            });
    
            elementSvg.appendChild(path);
    
            contenier.appendChild(elementSvg);
    
            element.appendChild(contenier);
        }

       

        return element;
    }

    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttributeNS(null, k, attrs[k]);
        return el;
    }


}
