window.onload = function () {
    const image1Input = document.getElementById('image1Input');
    const image2Input = document.getElementById('image2Input');
    const image1Canvas = document.getElementById('image1Canvas');
    const image2Canvas = document.getElementById('image2Canvas');
    const ssimResult = document.getElementById('ssimResult');
    const msSsimResult = document.getElementById('msSsimResult');
    const psnrResult = document.getElementById('psnrResult');

    let img1 = null;
    let img2 = null;

    function loadImage(input, canvas, imgVar) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    if (imgVar === 1) {
                        img1 = img;
                    } else {
                        img2 = img;
                    }
                    calculateMetrics();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    image1Input.addEventListener('change', () => loadImage(image1Input, image1Canvas, 1));
    image2Input.addEventListener('change', () => loadImage(image2Input, image2Canvas, 2));

    function calculateMetrics() {
        if (img1 && img2) {
            // 画像のサイズが異なる場合はエラーメッセージを表示
            if (img1.width !== img2.width || img1.height !== img2.height) {
                ssimResult.textContent = 'Error: Image sizes do not match.';
                msSsimResult.textContent = 'Error: Image sizes do not match.';
                psnrResult.textContent = 'Error: Image sizes do not match.';
                return;
            }

            const image1Data = image1Canvas.getContext('2d').getImageData(0, 0, img1.width, img1.height);
            const image2Data = image2Canvas.getContext('2d').getImageData(0, 0, img2.width, img2.height);

            // ImageDataをダウンサンプリングするヘルパー関数
            function downsampleImageData(imageData, scale) {
                const originalWidth = imageData.width;
                const originalHeight = imageData.height;
                const newWidth = Math.floor(originalWidth / scale);
                const newHeight = Math.floor(originalHeight / scale);

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = originalWidth;
                tempCanvas.height = originalHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(imageData, 0, 0);

                const scaledCanvas = document.createElement('canvas');
                scaledCanvas.width = newWidth;
                scaledCanvas.height = newHeight;
                const scaledCtx = scaledCanvas.getContext('2d');

                // nearest-neighborでダウンサンプリング
                scaledCtx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);

                return scaledCtx.getImageData(0, 0, newWidth, newHeight);
            }

            // PSNR計算
            function calculatePSNR(imgData1, imgData2) {
                let mse = 0;
                for (let i = 0; i < imgData1.data.length; i += 4) {
                    // RGBチャネルのみを考慮 (Aは無視)
                    mse += Math.pow(imgData1.data[i] - imgData2.data[i], 2);     // R
                    mse += Math.pow(imgData1.data[i + 1] - imgData2.data[i + 1], 2); // G
                    mse += Math.pow(imgData1.data[i + 2] - imgData2.data[i + 2], 2); // B
                }
                mse /= (imgData1.data.length / 4) * 3; // ピクセル数 * 3チャネル

                if (mse === 0) return Infinity; // 完全に一致する場合

                const maxVal = 255; // 8-bit画像の場合
                return 10 * Math.log10(maxVal * maxVal / mse);
            }

            // SSIM計算
            function calculateSSIM(imgData1, imgData2) {
                const C1 = Math.pow(0.01 * 255, 2);
                const C2 = Math.pow(0.03 * 255, 2);
                const C3 = C2 / 2;

                const width = imgData1.width;
                const height = imgData1.height;

                let ssimSum = 0;
                let numBlocks = 0;

                // 8x8のブロックで処理
                for (let y = 0; y < height; y += 8) {
                    for (let x = 0; x < width; x += 8) {
                        let mu1 = 0, mu2 = 0;
                        let sigma1_sq_sum = 0, sigma2_sq_sum = 0, sigma12_sum = 0; // Sums for variance/covariance
                        let count = 0;

                        for (let j = 0; j < 8 && y + j < height; j++) {
                            for (let i = 0; i < 8 && x + i < width; i++) {
                                const idx1 = ((y + j) * width + (x + i)) * 4;
                                const idx2 = ((y + j) * width + (x + i)) * 4;

                                // グレースケール値に変換 (輝度計算)
                                const pixel1 = 0.299 * imgData1.data[idx1] + 0.587 * imgData1.data[idx1 + 1] + 0.114 * imgData1.data[idx1 + 2];
                                const pixel2 = 0.299 * imgData2.data[idx2] + 0.587 * imgData2.data[idx2 + 1] + 0.114 * imgData2.data[idx2 + 2];

                                mu1 += pixel1;
                                mu2 += pixel2;
                                sigma1_sq_sum += pixel1 * pixel1;
                                sigma2_sq_sum += pixel2 * pixel2;
                                sigma12_sum += pixel1 * pixel2;
                                count++;
                            }
                        }

                        if (count === 0) continue;

                        mu1 /= count;
                        mu2 /= count;

                        const sigma1_sq = (sigma1_sq_sum / count) - (mu1 * mu1);
                        const sigma2_sq = (sigma2_sq_sum / count) - (mu2 * mu2);
                        const sigma12 = (sigma12_sum / count) - (mu1 * mu2);

                        // Add epsilon to denominators and Math.max(0, ...) for square roots
                        const l = (2 * mu1 * mu2 + C1) / (mu1 * mu1 + mu2 * mu2 + C1 + 1e-10);
                        const c = (2 * Math.sqrt(Math.max(0, sigma1_sq)) * Math.sqrt(Math.max(0, sigma2_sq)) + C2) / (Math.max(0, sigma1_sq) + Math.max(0, sigma2_sq) + C2 + 1e-10);
                        const s = (sigma12 + C3) / (Math.sqrt(Math.max(0, sigma1_sq)) * Math.sqrt(Math.max(0, sigma2_sq)) + C3 + 1e-10);

                        ssimSum += l * c * s;
                        numBlocks++;
                    }
                }

                return ssimSum / numBlocks;
            }

            // MS-SSIM計算
            function calculateMSSSIM(imgData1, imgData2) {
                const weights = [0.0448, 0.2856, 0.3001, 0.2363, 0.1333]; // MS-SSIMの重み
                let msssim = 1;

                let currentImgData1 = imgData1;
                let currentImgData2 = imgData2;

                for (let i = 0; i < weights.length; i++) {
                    if (currentImgData1.width < 8 || currentImgData1.height < 8) {
                        // 画像サイズが小さくなりすぎたら終了
                        break;
                    }

                    const ssim = calculateSSIM(currentImgData1, currentImgData2);
                    msssim *= Math.pow(ssim, weights[i]);

                    // 次のスケールのためにダウンサンプリング
                    if (i < weights.length - 1) {
                        currentImgData1 = downsampleImageData(currentImgData1, 2);
                        currentImgData2 = downsampleImageData(currentImgData2, 2);
                    }
                }
                return msssim;
            }

            const psnr = calculatePSNR(image1Data, image2Data);
            const ssim = calculateSSIM(image1Data, image2Data);
            const msSsim = calculateMSSSIM(image1Data, image2Data);

            psnrResult.textContent = psnr.toFixed(4);
            ssimResult.textContent = ssim.toFixed(4);
            msSsimResult.textContent = msSsim.toFixed(4);
        }
    }
};