w = open('prepared_template.json','w')
all_lines = []

with open("unprepared_template.json") as f:
    for line in f:
    	line = line.strip("\n") + " \\\n"
    	all_lines.append(line)

w.writelines(all_lines)
f.close()
w.close()
