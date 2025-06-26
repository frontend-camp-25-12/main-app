import ts from "typescript";

export function extractTsdoc(member: ts.ClassElement, sourceFile: ts.SourceFile): string {
  const jsDocComments = ts.getJSDocCommentsAndTags(member);
  if (jsDocComments.length > 0) {
    const jsDocComment = jsDocComments[0];
    if (ts.isJSDoc(jsDocComment)) {
      let docParts: string[] = [];
      // 提取说明
      if (jsDocComment.comment) {
        if (typeof jsDocComment.comment === 'string') {
          docParts.push(jsDocComment.comment);
        } else if (Array.isArray(jsDocComment.comment)) {
          docParts.push(jsDocComment.comment.map(c => c.text || '').join(''));
        }
      }

      // 提取所有标签
      if (jsDocComment.tags) {
        jsDocComment.tags.forEach(tag => {
          if (ts.isJSDocParameterTag(tag)) {
            console.log(JSON.stringify(tag.getText()))
            docParts.push(tag.getText().trim().replace(/\r\n.*/, ''));
          }
        });
      }

      return docParts.filter(part => part.trim()).join('\n    * ');
    }
  }
  return '';
}