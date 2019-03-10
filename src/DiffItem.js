const Colorfy = require('./Colorfy').Colorfy

class DiffItem {
  get isSameType () {
    return !!this.type && !!this.kind
  }

  constructor (left, right) {
    if (arguments.length === 2) {
      left = left || {}
      right = right || {}
      this.setType(left.type, right.type)
      this.setKind(left.kind, right.kind)
      this.setValues(left.value, right.value)
    }
  }

  setType (leftType, rightType) {
    if (leftType === rightType) {
      this.type = leftType
    } else if (leftType && (rightType === undefined || rightType === 'undefined')) {
      this.type = leftType
      this.typeAdded = leftType
    } else if (rightType && (leftType === undefined || leftType === 'undefined')) {
      this.type = rightType
      this.typeRemoved = rightType
    } else {
      this.typeAdded = leftType
      this.typeRemoved = rightType
    }
  }

  setKind (leftKind, rightKind) {
    if (leftKind === rightKind) {
      this.kind = leftKind
    } else if (leftKind && (rightKind === undefined || rightKind === 'undefined')) {
      this.kind = leftKind
      this.kindAdded = leftKind
    } else if (rightKind && (leftKind === undefined || leftKind === 'undefined')) {
      this.kind = rightKind
      this.kindRemoved = rightKind
    } else {
      this.kindAdded = leftKind
      this.kindRemoved = rightKind
    }
  }

  setKey (leftKey, rightKey) {
    if (leftKey === rightKey) {
      this.key = leftKey
    } else if (leftKey && !rightKey) {
      this.key = leftKey
      this.keyAdded = leftKey
    } else if (rightKey && !leftKey) {
      this.key = rightKey
      this.keyRemoved = rightKey
    } else {
      this.keyAdded = leftKey
      this.keyRemoved = rightKey
    }
  }

  setValues (leftValue, rightValue) {
    if (this.type === 'object') {
      if (this.kind === 'object') {
        this.handlePlainObject(leftValue, rightValue)
        return
      }

      if (this.kind === 'array') {
        this.handleArray(leftValue, rightValue)
        return
      }
    }

    // if (this.type === 'string' || this.type === 'number') {
    this.handleComparableValue(leftValue, rightValue)
    // }

    if (!this.type) {
      this.valueAdded = leftValue
      this.valueRemoved = rightValue
    }
  }

  handleComparableValue (leftValue, rightValue) {
    if (leftValue === rightValue) {
      this.value = leftValue
    } else {
      this.valueAdded = leftValue
      this.valueRemoved = rightValue
    }
  }

  handlePlainObject (leftValue, rightValue) {
    const leftKeys = Object.keys(leftValue)
    const rightKeys = Object.keys(rightValue)
    const allKeys = leftKeys
      .concat(rightKeys)
      .filter((val, index, arr) => arr.indexOf(val) === index)

    this.values = allKeys.map((key) => {
      const diffItem = new DiffItem(leftValue[key], rightValue[key])
      diffItem.setKey(
        leftKeys.indexOf(key) === -1 ? null : key,
        rightKeys.indexOf(key) === -1 ? null : key
      )

      return diffItem
    })
  }

  handleArray (leftValue, rightValue) {
    this.values = []

    const len = Math.max(leftValue.length, rightValue.length)
    for (let i = 0; i < len; i++) {
      const diffItem = new DiffItem(leftValue[i], rightValue[i])
      this.values.push(diffItem)
    }
  }

  print (isTTY) {
    const colorfy = new Colorfy()
    return colorfy.print(this.diffResult, isTTY)
  }

  parse (isTTY) {
    const colorfy = new Colorfy()
    return colorfy.parse(this.diffResult, isTTY)
  }
}

module.exports.DiffItem = DiffItem