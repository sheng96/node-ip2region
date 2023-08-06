"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newWithBuffer = exports.newWithVectorIndex = exports.newWithFileOnly = exports.loadContentFromFile = exports.loadVectorIndexFromFile = exports.isValidIp = void 0;
var fs = require("fs");
var path = require("path");
var VectorIndexSize = 8;
var VectorIndexCols = 256;
var VectorIndexLength = 256 * 256 * (4 + 4);
var SegmentIndexSize = 14;
var IP_REGEX = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
var getStartEndPtr = Symbol("#getStartEndPtr");
var getBuffer = Symbol("#getBuffer");
var openFilePromise = Symbol("#openFilePromise");
var Searcher = /** @class */ (function () {
    function Searcher(dbFile, vectorIndex, buffer) {
        this._dbFile = dbFile;
        this._vectorIndex = vectorIndex;
        this._buffer = buffer;
        if (this._buffer) {
            this._vectorIndex = this._buffer.subarray(256, 256 + VectorIndexLength);
        }
    }
    Searcher.prototype[getStartEndPtr] = function (idx, fd, ioStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var sPtr, ePtr, buf, sPtr, ePtr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._vectorIndex) return [3 /*break*/, 1];
                        sPtr = this._vectorIndex.readUInt32LE(idx);
                        ePtr = this._vectorIndex.readUInt32LE(idx + 4);
                        return [2 /*return*/, { sPtr: sPtr, ePtr: ePtr }];
                    case 1: return [4 /*yield*/, this[getBuffer](256 + idx, 8, fd, ioStatus)];
                    case 2:
                        buf = _a.sent();
                        sPtr = buf.readUInt32LE();
                        ePtr = buf.readUInt32LE(4);
                        return [2 /*return*/, { sPtr: sPtr, ePtr: ePtr }];
                }
            });
        });
    };
    Searcher.prototype[getBuffer] = function (offset, length, fd, ioStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var buf_1;
            return __generator(this, function (_a) {
                if (this._buffer) {
                    return [2 /*return*/, this._buffer.subarray(offset, offset + length)];
                }
                else {
                    buf_1 = Buffer.alloc(length);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            ioStatus.ioCount += 1;
                            fs.read(fd, buf_1, 0, length, offset, function (err) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(buf_1);
                                }
                            });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    Searcher.prototype[openFilePromise] = function (fileName) {
        return new Promise(function (resolve, reject) {
            fs.open(fileName, "r", function (err, fd) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(fd);
                }
            });
        });
    };
    Searcher.prototype.search = function (ip) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, ioStatus, fd, ps, i0, i1, i2, i3, ipInt, idx, _a, sPtr, ePtr, l, h, result, m, p, buff, sip, eip, dataLen, dataPtr, data, diff, took;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = process.hrtime();
                        ioStatus = {
                            ioCount: 0
                        };
                        if (!isValidIp(ip)) {
                            throw new Error("IP: ".concat(ip, " is invalid"));
                        }
                        fd = null;
                        if (!!this._buffer) return [3 /*break*/, 2];
                        return [4 /*yield*/, this[openFilePromise](this._dbFile)];
                    case 1:
                        fd = _b.sent();
                        _b.label = 2;
                    case 2:
                        ps = ip.split(".");
                        i0 = parseInt(ps[0]);
                        i1 = parseInt(ps[1]);
                        i2 = parseInt(ps[2]);
                        i3 = parseInt(ps[3]);
                        ipInt = i0 * 256 * 256 * 256 + i1 * 256 * 256 + i2 * 256 + i3;
                        idx = i0 * VectorIndexCols * VectorIndexSize + i1 * VectorIndexSize;
                        return [4 /*yield*/, this[getStartEndPtr](idx, fd, ioStatus)];
                    case 3:
                        _a = _b.sent(), sPtr = _a.sPtr, ePtr = _a.ePtr;
                        l = 0;
                        h = (ePtr - sPtr) / SegmentIndexSize;
                        result = null;
                        _b.label = 4;
                    case 4:
                        if (!(l <= h)) return [3 /*break*/, 10];
                        m = (l + h) >> 1;
                        p = sPtr + m * SegmentIndexSize;
                        return [4 /*yield*/, this[getBuffer](p, SegmentIndexSize, fd, ioStatus)];
                    case 5:
                        buff = _b.sent();
                        sip = buff.readUInt32LE(0);
                        if (!(ipInt < sip)) return [3 /*break*/, 6];
                        h = m - 1;
                        return [3 /*break*/, 9];
                    case 6:
                        eip = buff.readUInt32LE(4);
                        if (!(ipInt > eip)) return [3 /*break*/, 7];
                        l = m + 1;
                        return [3 /*break*/, 9];
                    case 7:
                        dataLen = buff.readUInt16LE(8);
                        dataPtr = buff.readUInt32LE(10);
                        return [4 /*yield*/, this[getBuffer](dataPtr, dataLen, fd, ioStatus)];
                    case 8:
                        data = _b.sent();
                        result = data.toString("utf-8");
                        return [3 /*break*/, 10];
                    case 9: return [3 /*break*/, 4];
                    case 10:
                        if (fd) {
                            fs.close(fd);
                        }
                        diff = process.hrtime(startTime);
                        took = (diff[0] * 1e9 + diff[1]) / 1e3;
                        return [2 /*return*/, { region: result, ioCount: ioStatus.ioCount, took: took }];
                }
            });
        });
    };
    return Searcher;
}());
var _checkFile = function (dbPath) {
    try {
        fs.accessSync(dbPath, fs.constants.F_OK);
    }
    catch (err) {
        throw new Error("".concat(dbPath, " ").concat(err ? "does not exist" : "exists"));
    }
    try {
        fs.accessSync(dbPath, fs.constants.R_OK);
    }
    catch (err) {
        throw new Error("".concat(dbPath, " ").concat(err ? "is not readable" : "is readable"));
    }
};
var isValidIp = function (ip) {
    return IP_REGEX.test(ip);
};
exports.isValidIp = isValidIp;
var newWithFileOnly = function (dbPath) {
    dbPath = dbPath ? dbPath : path.join(__dirname, "../data/ip2region.xdb");
    _checkFile(dbPath);
    return new Searcher(dbPath, null, null);
};
exports.newWithFileOnly = newWithFileOnly;
var newWithVectorIndex = function (dbPath, vectorIndex) {
    _checkFile(dbPath);
    if (!Buffer.isBuffer(vectorIndex)) {
        throw new Error("vectorIndex is invalid");
    }
    return new Searcher(dbPath, vectorIndex, null);
};
exports.newWithVectorIndex = newWithVectorIndex;
var newWithBuffer = function (buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("buffer is invalid");
    }
    return new Searcher("", null, buffer);
};
exports.newWithBuffer = newWithBuffer;
var loadVectorIndexFromFile = function (dbPath) {
    var fd = fs.openSync(dbPath, "r");
    var buffer = Buffer.alloc(VectorIndexLength);
    fs.readSync(fd, buffer, 0, VectorIndexLength, 256);
    fs.close(fd);
    return buffer;
};
exports.loadVectorIndexFromFile = loadVectorIndexFromFile;
var loadContentFromFile = function (dbPath) {
    var stats = fs.statSync(dbPath);
    var buffer = Buffer.alloc(stats.size);
    var fd = fs.openSync(dbPath, "r");
    fs.readSync(fd, buffer, 0, stats.size, 0);
    fs.close(fd);
    return buffer;
};
exports.loadContentFromFile = loadContentFromFile;
