document.addEventListener('DOMContentLoaded', function () {
    const pdfInput = document.getElementById('pdf-input');
    const pdfViewer = document.getElementById('pdf-viewer');
    const readButton = document.getElementById('read-pdf-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const stopButton = document.getElementById('stop-button');
    const prevPageButton = document.getElementById('prev-page-button');
    const nextPageButton = document.getElementById('next-page-button');
    const goToPageButton = document.getElementById('go-to-page-button');
    const pageNumberInput = document.getElementById('page-number-input');
    const searchTopicButton = document.getElementById('search-topic-button');
    const topicSearchInput = document.getElementById('topic-search-input');
    const languageSelect = document.getElementById('language-select');
    const status = document.getElementById('status');
    let currentPage = 1;
    let pdfDoc = null;
    let pdfText = '';
    let isReading = false;
    let synthesis = window.speechSynthesis;
    let utterance = new SpeechSynthesisUtterance();

    // Function to render a PDF page in the same container
    function renderPage(pageNum) {
        pdfDoc.getPage(pageNum).then(function(page) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            page.render(renderContext).promise.then(function() {
                // Replace content with the rendered PDF page
                pdfViewer.innerHTML = '';
                pdfViewer.appendChild(canvas);
                pdfText = '';
                // Extract text for text-to-speech
                page.getTextContent().then(function(textContent) {
                    textContent.items.forEach(function(item) {
                        pdfText += item.str + ' ';
                    });
                });
            });
        });
    }

    // Function to load and display the PDF (used by both file input and dropdown)
    function loadPDF(pdfData) {
        const loadingTask = pdfjsLib.getDocument(pdfData);
        loadingTask.promise.then(function(pdf) {
            pdfDoc = pdf;
            document.getElementById('page-count').textContent = pdf.numPages;
            currentPage = 1;
            renderPage(currentPage);
            status.textContent = `PDF loaded: ${pdf.numPages} pages`;
        }).catch(error => {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF.');
            status.textContent = 'Error loading PDF.';
        });
    }

    // Handle PDF selection from file input
    pdfInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = function() {
                const typedArray = new Uint8Array(this.result);
                loadPDF(typedArray); // Load the PDF file into the viewer
            };
            fileReader.readAsArrayBuffer(file);
        } else {
            alert('Please select a valid PDF file.');
        }
    });

    // Handle PDF selection from dropdown
    document.getElementById('selectpdf-bookt').addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
            loadPDF(selectedValue); // Load the PDF from URL into the same viewer
        }
    });

    // Text-to-Speech functionality
    readButton.addEventListener('click', function() {
        if (!isReading && pdfText) {
            utterance.text = pdfText;
            utterance.lang = languageSelect.value;
            synthesis.speak(utterance);
            isReading = true;
        }
    });

    pauseButton.addEventListener('click', function() {
        if (isReading) {
            synthesis.pause();
        }
    });

    resumeButton.addEventListener('click', function() {
        if (isReading) {
            synthesis.resume();
        }
    });

    stopButton.addEventListener('click', function() {
        if (isReading) {
            synthesis.cancel();
            isReading = false;
        }
    });

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < pdfDoc.numPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });

    goToPageButton.addEventListener('click', function() {
        const pageNumber = parseInt(pageNumberInput.value, 10);
        if (pageNumber >= 1 && pageNumber <= pdfDoc.numPages) {
            currentPage = pageNumber;
            renderPage(currentPage);
        }
    });

    // Merriam-Webster Dictionary integration and other functionality...
    // (rest of your code continues as you had for dictionary and search)
});
