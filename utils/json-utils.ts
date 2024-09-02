'use strict';

const connections = {
  "commits-files-users": {
    from: "commits-files",
    to: "users",
  },
  "branches-files-files": {
    from: "branches-files",
    to: "files",
  },
}

// used to make the exported database json files smaller
// removes redundant information. Smaller json files enable quicker loading of the offline binocular artifact.
export function compressJson(collectionName: string, input: any[]) {
  let result = compressCollectionJson(input);

  // if this is a connection, we can do some additional compression
  if (collectionName.split("-").length > 1) {
    result = compressConnectionJson(collectionName, result);
  }

  // specific compressions for the ownership connection
  if (collectionName === "commits-files-users") {
    result = compressOwnershipConnection(result);
  }

  return result;
}

// used by the offline db to add the infos removed by the `compressJson` function.
export function decompressJson(collectionName: string, input: any[]) {
  // if this wasn't compressed, don't try to decompress.
  // since we remove the prefix of the _id attribute in every collection,
  //  the id should not contain a '/' if the collection was compressed.
  if (input.length !== 0 && input[0]?._id?.includes('/')) {
    return input;
  }

  let result = decompressCollectionJson(collectionName, input);
  if (collectionName.split("-").length > 1) {
    result = decompressConnectionJson(collectionName, result);
  }
  if (collectionName === "commits-files-users") {
    result = decompressOwnershipConnection(result);
  }

  return result;
}

function compressCollectionJson(input: any[]) {
  return input.map((i) => {
    // not used by pouchDB
    delete i._key;
    delete i._rev;
    // the ids always have the following form: <collectionName>/<id>
    // the collection name can be inferred by the file name, so we don't need to store it in every id
    i._id = i._id.split("/")[1];
    return i;
  });
}

function decompressCollectionJson(collectionName: string, input: any[]) {
  return input.map((i) => {
    // the ids always have the following form: <collectionName>/<id>
    // the collection name can be inferred by the file name
    i._id = collectionName + "/" + i._id;
    return i;
  });
}


function compressConnectionJson(collectionName: string, input: any[]) {

  // if we have not specified how complex collections are split, don't touch the _from and _to attributes.
  // see function decompressConnectionJson
  if (collectionName.split("-").length > 2 && !connections[collectionName]) {
    return input;
  }

  return input.map((i) => {
    i._from = i._from.split("/")[1];
    i._to = i._to.split("/")[1];
    return i;
  });
}

function decompressConnectionJson(collectionName: string, input: any[]) {
  const collections = collectionName.split("-");
  let fromCollection = "";
  let toCollection = "";

  // for simple connections, we can infer the from/to collection using the connection name
  if (collections.length == 2) {
    fromCollection = collections[0] + "/";
    toCollection = collections[1] + "/";
  } else if (connections[collectionName]) {
    // for complex connections (like "commits-files-users"),
    // we cannot be sure if it is a connection from e.g. "commits" to "files-users" or from "commits-files" to "users"
    // only do this if it is defined in the global "connections" object.
    fromCollection = connections[collectionName].from + "/";
    toCollection = connections[collectionName].to + "/";
  }
  // Else we do not know how the complex connection is split, so we do not try to change the from/to
  //  since in this case the collection prefixes have not been removed. See function compressConnectionJson.

  return input.map((i) => {
    i._from = fromCollection + i._from;
    i._to = toCollection + i._to;
    return i;
  });
}


function compressOwnershipConnection(input: any[]) {
  return input.map((i) => {
    i.hunks = i.hunks.map((h) => {
      // replace "originalCommit" attribute name. Since this collection tends to be very large, this makes a reasonable difference
      h.oc = h.originalCommit;
      delete h.originalCommit;
      // replace the lines objects by strings
      h.lines = h.lines.map((l) => `${l.from},${l.to}`);
      return h;
    });
    return i;
  });
}

function decompressOwnershipConnection(input: any[]) {
  return input.map((i) => {
    i.hunks = i.hunks.map((h) => {
      h.originalCommit = h.oc;
      delete h.oc;
      h.lines = h.lines.map((l) => {
        const fromTo = l.split(",");
        return { from: fromTo[0], to:fromTo[1] }
      });
      return h;
    });
    return i;
  });
}
