# Quick script to prepare CFN template to embed inline into cf_build.js
# adds a / to each line and replaces \n with \\n as well as ' with \'

w = open('prepared_template.txt','w')
all_lines = []

with open("unprepared_template.json") as f:
    for line in f:
        line = line.replace("'", "\\'")
        line = line.replace("\\n", "\\\\n")
        line = line.strip("\n") + " \\\n"
        all_lines.append(line)

w.writelines(all_lines)
f.close()
w.close()
