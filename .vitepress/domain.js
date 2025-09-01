// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
//  If you want it, then you'll have to decrypt it
import crypto from 'crypto';

const domainName = () => {
    const encryptedDomain = '9e845de6f1796b7bf4f35c78459159e5f01926cf5a0fab3807367f0481e26674';
    const decrypt = (encrypted) => {
        const algorithm = 'aes-256-cbc';
        const key = 'Ito9DfYbqFyhBp+khbWc8Iz3p4DwXUNP';
        const iv = 'lu/5DagcMa/kwWs3';
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };
    return decrypt(encryptedDomain);
}

export {
    domainName
}