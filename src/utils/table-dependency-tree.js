function walk(node, processor) {
  function walkInternal(node, parent, processor) {
    processor(node, parent);
    node.children.forEach((childNode) => walkInternal(childNode, node, processor));
  }

  walkInternal(node, undefined, processor);
}

export function createRoot(nameOfRoot) {
  return {
    data: {
      table: nameOfRoot,
      columns: [],
    },
    children: [],
  };
}

export function pushNode(nodeId, node, metaDataAboutTables) {
  const [firstId, ...restIds] = nodeId.split('.');

  if (restIds.length > 0) {
    let findChildrenByJoinColumn = node.children.find((el) => el.data.joinColumn === firstId);

    if (findChildrenByJoinColumn === undefined) {
      findChildrenByJoinColumn = {
        data: {
          table: metaDataAboutTables[node.data.table].references[firstId].tableReference,
          joinColumn: firstId,
          columns: [],
        },
        children: [],
      };

      node.children.push(findChildrenByJoinColumn);
    }

    pushNode(restIds.join('.'), findChildrenByJoinColumn, metaDataAboutTables);
  } else if (!node.data.columns.includes(firstId)) {
    node.data.columns.push(firstId);
  }
}

export function findNode(nodeId, node) {
  const [firstId, ...restIds] = nodeId.split('.');

  if (restIds.length > 0) {
    const findChildrenByJoinColumn = node.children.find((el) => el.data.joinColumn === firstId);

    if (findChildrenByJoinColumn === undefined) return null;

    return findNode(restIds.join('.'), findChildrenByJoinColumn);
  }

  if (node.data.columns.includes(firstId)) {
    return node;
  }

  return null;
}

export function toArray(tree) {
  const array = [];

  walk(tree, (node, parent) => {
    array.push({ node, parent });
  });

  return array;
}
