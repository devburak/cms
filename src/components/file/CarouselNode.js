import { DecoratorNode } from 'lexical';
import React from 'react';
import {
  createCommand,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR
} from 'lexical';
import Carousel from 'react-material-ui-carousel';

// CarouselNode bileşeni
class CarouselNode extends DecoratorNode {
  static getType() {
    return 'carousel';
  }

  static clone(node) {
    return new CarouselNode(node.__images);
  }

  constructor(images) {
    super();
    this.__images = images; // Görselleri saklayan özel bir alan
  }

  exportJSON() {
    return {
      type: 'carousel',
      version: 1,
      images: this.__images,
    };
  }

  static importJSON(serializedNode) {
    const { images } = serializedNode;
    return new CarouselNode(images);
  }

  /**
   * 1) exportDOM metodunu ekliyoruz.
   *    $generateHtmlFromNodes() bu metodu çağıracak ve
   *    CarouselNode'un HTML çıktısını elde edecek.
   */
  exportDOM() {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.id = 'carousel-wrapper';
    wrapperDiv.style.display = 'flex';
    wrapperDiv.style.justifyContent = 'center';
    wrapperDiv.style.alignItems = 'center';
    wrapperDiv.style.position = 'relative';
    wrapperDiv.style.width = '100%';
    wrapperDiv.style.maxWidth = '690px';
    wrapperDiv.style.margin = '0 auto';
    // wrapperDiv.style.overflow = 'hidden';

    const containerDiv = document.createElement('div');
    containerDiv.id = 'carousel-container';
    containerDiv.style.display = 'inline-block';
    containerDiv.style.position = 'relative';
    containerDiv.style.maxWidth = '690px';
    containerDiv.style.maxHeight = '400px';
    containerDiv.style.width = '100%';
    containerDiv.style.margin = '0 auto';
    containerDiv.style.verticalAlign = 'middle';

    const innerDiv = document.createElement('div');
    innerDiv.style.display = 'flex';
    innerDiv.style.flexWrap = 'nowrap';
    innerDiv.style.height = '400px';
    innerDiv.style.width = `${this.__images.length * 100}%`;
    innerDiv.style.transition = 'transform 0.5s ease';

    this.__images.forEach((src) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'carousel-slide-div';
        slideDiv.style.flex = '0 0 100%';
        slideDiv.style.display = 'flex';
        slideDiv.style.justifyContent = 'center';
        slideDiv.style.alignItems = 'center';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Carousel Slide';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';

        slideDiv.appendChild(img);
        innerDiv.appendChild(slideDiv);
    });

    containerDiv.appendChild(innerDiv);

    const prevButton = document.createElement('button');
    prevButton.id = 'carousel-prev';
    prevButton.innerHTML = '‹';
    prevButton.style.position = 'absolute';
    prevButton.style.top = '50%';
    prevButton.style.left = '10px';
    prevButton.style.transform = 'translateY(-50%)';
    prevButton.style.background = 'rgba(0, 0, 0, 0.5)';
    prevButton.style.color = 'white';
    prevButton.style.border = 'none';
    prevButton.style.borderRadius = '50%';
    prevButton.style.width = '40px';
    prevButton.style.height = '40px';
    prevButton.style.cursor = 'pointer';
    prevButton.style.zIndex = '2';

    const nextButton = document.createElement('button');
    nextButton.id = 'carousel-next';
    nextButton.innerHTML = '›';
    nextButton.style.position = 'absolute';
    nextButton.style.top = '50%';
    nextButton.style.right = '10px';
    nextButton.style.transform = 'translateY(-50%)';
    nextButton.style.background = 'rgba(0, 0, 0, 0.5)';
    nextButton.style.color = 'white';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '50%';
    nextButton.style.width = '40px';
    nextButton.style.height = '40px';
    nextButton.style.cursor = 'pointer';
    nextButton.style.zIndex = '2';

    containerDiv.appendChild(prevButton);
    containerDiv.appendChild(nextButton);

    wrapperDiv.appendChild(containerDiv);

    return { element: wrapperDiv };
}


  createDOM() {
    // Burada sadece React'te kullanılacak bir placeholder <div> döndürüyoruz
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.width = '100%';
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    // React tarafında, Material UI Carousel ile slide gösterimini sağlıyoruz
    return <MaterialUiCarousel images={this.__images} />;
  }
}

// React bileşeni (react-material-ui-carousel ile oluşturduğumuz)
function MaterialUiCarousel({ images }) {
  const outerContainerStyle = {
    display: 'inline-block',
    position: 'relative',
    maxWidth: '690px',
    maxHeight: '400px',
    width: '100%',
    margin: '0 auto',
    verticalAlign: 'middle',
  };

  return (
    <div style={outerContainerStyle}>
      <Carousel
        autoPlay={true}
        interval={4000}
        navButtonsAlwaysVisible={true}
        cycleNavigation={true}
        animation="slide"
        swipe={true}
        // Material UI Carousel'de height prop'unu ayarlayabilirsiniz
        height="400px"
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              maxHeight: '400px',
              margin: '0 auto',
            }}
          />
        ))}
      </Carousel>
    </div>
  );
}

// Yardımcı fonksiyonlar
export function $createCarouselNode(images) {
  return new CarouselNode(images);
}

export function $isCarouselNode(node) {
  return node instanceof CarouselNode;
}

export const INSERT_CAROUSEL_COMMAND = createCommand('INSERT_CAROUSEL_COMMAND');

export function registerCarouselCommand(editor) {
  return editor.registerCommand(
    INSERT_CAROUSEL_COMMAND,
    (payload) => {
      const carouselNode = $createCarouselNode(payload.images);
      $insertNodes([carouselNode]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR
  );
}

export default CarouselNode;
